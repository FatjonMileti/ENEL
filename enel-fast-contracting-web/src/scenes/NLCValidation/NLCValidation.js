import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import offerService from 'services/offer';

import { checkNLC, validateNLC, clearNLC, markAction } from 'store/client/actions';
import { fetchAllItems as fetchInvoiceExamples } from 'store/invoiceExamples/actions';
import {
    patch as patchSession,
    setProvider,
    unsetProvider,
} from 'store/session/actions';
import { updateRegistrationInfo } from 'store/registration/actions';

import HeaderHero from 'components/heroes/HeaderHero';
import Form from 'components/validation/form';
import Button from 'components/validation/button';
import FormErrors from 'components/FormErrors';
import ImagesOverlay from 'components/overlays/ImagesOverlay';
import Tooltip from 'components/Tooltip';
import { getSession } from 'store/session/selectors';
import { getItems } from 'store/counties/selectors';
import { getRegistrationNumber } from 'store/registration/selectors';
import { getItems as getDistributors } from 'store/distributors/selectors';
import { fetchAllItems as fetchDistributors } from 'store/distributors/actions';
import { getFlow, getNLC, getNLCValidation, getOptions as getClientOptions } from 'store/client/selectors';
import { getInvoice } from 'store/ocr/selectors';
import { getItems as getProviders } from 'store/providers/selectors';
import { getItems as getInvoiceExamples } from 'store/invoiceExamples/selectors';
import { showLoading, hideLoading } from '../../store/ui/actions';
import { ReCaptcha } from 'react-recaptcha-google';
import { RECAPTCHA_KEY } from 'utils/config';
import pageService from 'services/page';
import { toRegistrationPostData } from 'utils/serializers';

import './NLCValidation.scss';
import api from 'services/api';
import * as offersActions from 'store/offers/actions';

const propTypes = {
    invoice: PropTypes.object,
    counties: PropTypes.array,
    eeProviders: PropTypes.array,
    gazProviders: PropTypes.array,
    flow: PropTypes.string,
    nlc: PropTypes.object,
    nlcValidation: PropTypes.object,
    session: PropTypes.object,
    clientOptions: PropTypes.object,
    patchSession: PropTypes.func.isRequired,
    checkNLC: PropTypes.func.isRequired,
    distributors: PropTypes.array,
    fetchDistributors: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    invoice: {},
    counties: [],
    eeProviders: [],
    gazProviders: [],
    distributors: [],
    flow: '',
    nlc: {},
    nlcValidation: {},
    clientOptions: {},
    session: {
        client: {},
    },
};

class NLCValidation extends Component {

    form = {
        _loc: {
            cod_pod: this.loadNLC(),
        },
        _schimba_furnizor: null,
        _are_furnizare_activa: this.props.session[`${this.props.flow}_are_furnizare_activa`],
        _schimba_titular: this.props.session[`${this.props.flow}_schimba_titular`],
    };

    formErrors = {
        cod_pod: [],
    };

    state = {
        form: this.form,
        formErrors: this.formErrors,
        code: '',
        showOverlay: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.resetRecaptcha();
        this.props.fetchDistributors();
        this.props.fetchInvoiceExamples();
        this.props.markAction(pageService.actions.VALIDARE_LOC_CONSUM.value);
    }

    resetRecaptcha() {
        if (this.recaptcha) {
            this.recaptcha.reset();
        }
        this.setState({ code: '' });
    }

    loadNLC() {
        const sessionNLC = this.props.session[`${this.props.flow}_loc`] ? this.props.session[`${this.props.flow}_loc`].cod_pod : '';
        const ocrInvoiceNLC = this.props.invoice.code;

        return sessionNLC || ocrInvoiceNLC || '';
    }

    getLabel() {
        return this.props.flow == 'gaz' ? 'CLC' : 'POD';
    }

    getLabelExplicit() {
        return this.props.flow == 'gaz' ? 'CLC-ul (”Codul locului de consum”)' : 'POD-ul (”Point of Delivery”)';
    }

    getEnergyLabel() {
        return this.props.flow == 'gaz' ? 'gazelor naturale' : 'energiei electrice';
    }

    getNLCType() {
        if (this.props.session.contract_type === 'b2c' && !_.isNil(this.props.session.client) || this.props.session.contract_type === 'b2b' && !_.isNil(this.props.session.company)) {
            const county = _.find(
                this.props.counties,
                item => item.denumire === this.props.session.judet
            );

            if (this.props.flow == 'gaz') {
                return 'CLC';
            }

            if (county && county.distribution.distributie_enel == 'D') {
                return 'POD';
            }
        }

        return 'NLC';
    }

    getCurrentProvider() {
        const providerId = this.props.session[`${this.props.flow}_furnizor_actual`] || this.props.nlc.supplyerId;
        return _.find(this.props[`${this.props.flow}Providers`], item => item.internal_id == providerId);
    }

    getInvoiceExamples() {
        return _.map(this.props.podInvoiceExamples, item => item.url);
    }

    noErrors() {

        if (!_.isNil(_.find(this.state.formErrors, section => section.length > 0))) {
            return false;
        }
        return true;
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value.toUpperCase();
        this.setState({
            form: _.extend(this.state.form, {
                _loc: _.extend(this.state.form._loc, form),
            }),
        });
    }

    handleRecaptchaLoad() {
        if (this.recaptcha) {
            this.recaptcha.reset();
        }
    }

    handleRecaptchaToken(token) {
        this.setState({
            code: token,
        });
    }

    handleInvoiceExamplesClick() {
        this.setState({ showOverlay: true });
    }

    handleOverlayHide() {
        this.setState({ showOverlay: false });
    }

    async handleNextClick(e) {
        e.preventDefault();
        const shouldDisplayOfferList = true;

        await this.resetFormErrors();
        await this.validateRequiredCaptcha();

        if (this.noErrors()) {
            const {session} = this.props
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 9,
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });
            try {
                this.props.showLoading();
                await this.props.clearNLC();
                await this.props.validateNLC(this.state.form._loc.cod_pod);
                await this.props.checkNLC(this.state.form._loc.cod_pod, this.state.code);
                await this.validateNLC();
                this.resetRecaptcha();

                if (this.noErrors()) {
                    await this.props.patchSession(this.state.form);
                    await this.props.updateRegistrationInfo(
                        toRegistrationPostData({
                            codPod: this.state.form._loc.cod_pod,
                        }, this.props),
                        this.props.registrationNumber
                    );
                    pageService.scrollToTop();
                    const offerValidation = await api.get(`/validate-offer/${this.props.session.id}?status=${this.props.nlc.status}${(this.props.nlc.piata ? `&piata=${this.props.nlc.piata}` : '')}`);
                    if (!offerValidation.valid) {
                        const options = {
                            judet: this.props.session.judet,
                            furn24: '0',
                            status: this.props.nlc.status,
                            ...(this.props.nlc.piata ? { piata: this.props.nlc.piata } : {}),
                            sessionID: this.props.session.id,
                        };
                        if (this.props.session.contract_type === 'b2b') {
                            options.segment = 'BUSINESS';
                        }
                        await this.props.clearOffers();
                        await this.props.fetchOffers(options, this.props.flow.toUpperCase());
                        browserHistory.push({
                            pathname: pageService.links['plans'],
                            state: {
                                fromNLCValidation: true,
                            },
                        });
                    } else {
                        browserHistory.push(pageService.links['client-place-info']);
                    }
                }
                this.props.hideLoading();
            } catch (e) {
                this.props.hideLoading();
            }
        }
    }

    isNLCValid() {
        if (this.props.nlcValidation) {
            if (!this.props.nlcValidation.valid || this.props.flow.toLowerCase() !== this.props.nlcValidation.type.toLowerCase()) {
                return false;
            }

            if (this.props.flow.toLowerCase() == 'ee') {
                if (this.props.nlcValidation.isEnel && this.getNLCType() !== 'POD') {
                    return false;
                }
                if (!this.props.nlcValidation.isEnel && this.getNLCType() !== 'NLC') {
                    return false;
                }
            }
        }

        return true;
    }

    isCountyValid() {
        const county = _.find(
            this.props.counties,
            item => item.denumire === this.props.session.judet
        );
        if (this.props.nlcValidation && this.props.nlcValidation.county) {
            return this.props.session.judet === this.props.nlcValidation.county.denumire;
        } else if (this.props.nlcValidation.isEnel && county && county.distribution.distributie_enel !== 'D') {
            return false;
        }
        return true;
    }

    isDistributorValid() {
        // if (this.props.nlcValidation && this.props.nlcValidation.distributor) {
        //     const county = _.find(this.props.counties, item => item.denumire === this.props.session.judet);
        //     const distributor = _.find(this.props.distributors, item => parseInt(item.internal_id) == county.distribution.id_enel);

        //     if (distributor) {
        //         return this.props.nlcValidation.distributor.internal_id == distributor.internal_id;
        //     }
        // }

        return true;
    }

    validateNLC() {
        const { formErrors } = this.state;
        const form = Object.assign({}, this.state.form);

        if (_.isNil(this.props.nlc) || !this.state.form._loc.cod_pod) {
            formErrors.cod_pod.push(
                <span>
                    Cod {this.getLabel()} introdus nu a fost găsit. Verifică corectitudinea acestuia și încearcă din nou. Pentru mai multe detalii poți suna la 0800 07 07 01.
                </span>
            );
            return;
        }

        if (this.state.form._loc.cod_pod.substring(0, 3) === 'OTO') {
            formErrors.cod_pod.push(
                <span>
                    POD eronat. Contactati noul distribuitor Premier pentru POD-ul corect
                </span>
            );
            return;
        }


        if (!this.isCountyValid()) {
            formErrors.cod_pod.push(
                <span>
                    Județul locului de consum din {this.getLabel()} diferă de cel ales la selecția ofertei. Pentru mai multe detalii poți suna la 0800 07 07 01.
                </span>
            );
            return;
        }

        if (!this.isNLCValid()) {
            formErrors.cod_pod.push(
                <span>
                    Codul {this.getLabel()} introdus este invalid. Verifica inca o data codul de pe factura sau contractul tau si asigura-te ca l-ai inregistat corect (Codul {this.getLabel()} este alfanumeric, adica poate contine si litere si cifre). Daca aceste informatii nu le ai la indemana le poti afla de la distribuitorul tau. Clientii PPC pot afla aceste informatii la numarul de telefon 021.9977 (tarif normal).
                </span>
            );
            return;
        }

        if (this.props.flow == 'ee') {
            if (!this.isDistributorValid()) {
                formErrors.cod_pod.push(
                    <span>
                        Distribuitorul locului de consum diferă de cel din {this.getLabel()}. Pentru mai multe detalii poți suna la 0800 07 07 01.
                    </span>
                );
                return;
            }
        }

        if (this.props.session.contract_type === 'b2c' && !_.isNil(this.props.session.client) || this.props.session.contract_type === 'b2b' && !_.isNil(this.props.session.company)) {
            const county = _.find(this.props.counties, item => item.denumire === this.props.session.judet);
            const isEnelCounty = !_.isNil(county) && county.distribution.distributie_enel == 'D';

            if (this.props.nlc) {
                switch (this.props.nlc.status) {
                    case 'ACTIV':
                        if (this.props.nlc.piata === 'PL' && this.props.nlc.cnp_cui === (this.props.session.contract_type === 'b2c' ? this.props.session.client.cnp : this.props.session.company && this.props.session.company.data && this.props.session.company.data.cui) && this.props.nlc.noOfSupplies > 1) {
                            formErrors.cod_pod.push(
                                <span>
                                    Am identificat că în contractul comercial pe care îl ai cu PPC, figurezi cu mai multe locuri de consum.{' '}
                                    Contractarea online este însă disponibilă doar pentru contractele cu un singur loc de consum activ.<br /><br />
                                    Pentru a beneficia de oferta pe care ți-o dorești, te invităm să ne contactezi telefonic la 021 9977, apel cu tarif normal.<br /><br />
                                    Îți mulțumim că ai ales PPC!
                                </span>
                            );
                            return;
                        }
                        // if (this.props.flow == 'gaz') {
                        //     if (!(this.props.nlc.piata == 'PL' && this.props.nlc.cnp !== this.props.session.client.cnp)) {
                        //         formErrors.cod_pod.push(
                        //             <span>
                        //                 Contractul de furnizare pentru locul de consum selectat este activ la PPC.<br />Te rugăm să reiei procesul de contractare <a href="https://www.enel.ro/enel-muntenia/ro/clienti-rezidentiali/ofertele-tale.html" target="_blank" rel="noreferrer">aici</a>.
                        //             </span>
                        //         );
                        //         return;
                        //     }
                        // } else if (this.props.flow == 'ee') {
                        //     if (this.props.nlc.piata == 'PL' && this.props.nlc.cnp == this.props.session.client.cnp) {
                        //         formErrors.cod_pod.push(
                        //             <span>
                        //                 Contractul de furnizare pentru locul de consum selectat este activ la PPC.<br />Te rugăm să reiei procesul de contractare <a href="https://www.enel.ro/enel-muntenia/ro/clienti-rezidentiali/ofertele-tale.html" target="_blank" rel="noreferrer">aici</a>.
                        //             </span>
                        //         );
                        //         return;
                        //     }
                        // }

                        // update current provider based on NLC info
                        if (this.props.nlc.supplyerId) {
                            this.props.setProvider(this.props.nlc.supplyerId);
                        }
                        break;
                    case 'IN REZILIERE':
                        formErrors.cod_pod.push('Contractul de furnizare pentru locul de consum selectat este în curs de reziliere. Pentru mai multe detalii sună la 0800 07 07 01.');
                        return;
                    case 'IN PRELUARE':
                        formErrors.cod_pod.push('Există o solicitare în curs pentru încheierea unui contract de furnizare pentru locul de consum selectat. Pentru mai multe detalii sună la 0800 07 07 01.');
                        return;
                    case 'IN DERULARE':
                        formErrors.cod_pod.push('Există o solicitare în curs pentru încheierea unui contract de furnizare pentru locul de consum selectat. Pentru mai multe detalii sună la 0800 07 07 01.');
                        return;
                    case 'INACTIV':
                        break;
                    case 'NOK':
                        if (this.props.flow == 'ee' && isEnelCounty) {
                            formErrors.cod_pod.push(
                                <span>
                                    Codul POD/locul de consum nu a fost găsit în baza de date .Vă rugăm să iniţiaţi procedura de contractare pe un alt canal de vânzare.
                                </span>
                            );
                            return;
                        }
                        break;
                    default:
                        break;
                }
            }

            const provider = this.getCurrentProvider();
            const options = {
                flow: this.props.flow,
                nlc: this.props.nlc.status,
                isEnelCounty,
                activeContract: this.props.clientOptions[`${this.props.flow}_are_furnizare_activa`],
                provider: provider ? provider.denumire : null,
            };

            // update provider change and owner change based on NLC info
            form._schimba_furnizor = offerService.getProviderChange(options);

            form._schimba_titular = offerService.getOwnerChange({
                nlc: this.props.nlc,
                cnp_cui: this.props.session.contract_type === 'b2c' ? this.props.session.client.cnp : this.props.session.company && this.props.session.company.data && this.props.session.company.data.cui,
                userChoice: form._schimba_titular,
                isValidPOD: this.props.nlcValidation.valid,
            });
            // form._are_furnizare_activa = form._schimba_titular;

            if (this.props.nlc.districtId) {
                form._loc = _.extend(form._loc, {
                    judet: this.props.nlc.districtId,
                    localitate: this.props.nlc.cityId,
                    tip_strada: this.props.nlc.streetTypeId,
                    strada: this.props.nlc.streetId,
                    nr_strada: this.props.nlc.streetNo,
                    bloc: this.props.nlc.building,
                    scara: this.props.nlc.entrance,
                    etaj: this.props.nlc.floor,
                    apartament: this.props.nlc.apartment,
                });
            }
        }

        return new Promise((resolve) => {
            this.setState({
                formErrors,
                form,
            }, () => {
                resolve(true);
            });
        });
    }

    validateRequiredCaptcha() {
        const { formErrors } = this.state;

        if (!this.state.code) {
            formErrors.cod_pod.push('Trebuie să bifezi validarea reCAPTCHA.');
        }

        return new Promise((resolve) => {
            this.setState({
                formErrors,
            }, () => {
                resolve();
            });
        });
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });

        return new Promise((resolve) => {
            this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) }, () => {
                resolve();
            });
        });
    }

    renderFormErrors(section) {
        if (this.state.formErrors[section].length > 0) {
            return (
                <FormErrors
                    errors={this.state.formErrors[section]}
                />
            );
        }
    }

    render() {
        return (
            <div className="NLCValidation">
                <ImagesOverlay
                    show={this.state.showOverlay}
                    title={`Cum găsesc ${this.getLabel()}-ul pe factura de utilități?`}
                    images={this.getInvoiceExamples()}
                    onHide={this.handleOverlayHide}
                />
                <HeaderHero
                    title="Validare loc de consum"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <div className="page-description">
                    <div className="main-content">
                        {this.getLabelExplicit()} este numărul unic de identificare a locului tău de consum, adică locul
                        care este racordat la rețeaua de distribuție a {this.getEnergyLabel()}. {' '}
                        {this.getLabel()}-ul il gasesti pe factura sau in contractul de furnizare
                        a {this.getEnergyLabel()}
                    </div>
                </div>
                <div className="main-content bottom-margin" >
                    <div className="row">
                        <Form>
                            <div className="col-md-12">
                                <div>
                                    {this.renderFormErrors('cod_pod')}
                                    <div className="row">
                                        <div className="mb-3 col-md-12 col-lg-12" data-pgc="enel.input">
                                            <label htmlFor="cod_pod">{this.getLabel()}</label>
                                            {!_.isEmpty(this.props.podInvoiceExamples) && <Tooltip
                                                info={`Cum găsesc ${this.getLabel()}-ul pe factura de utilități?`}
                                                onClick={this.handleInvoiceExamplesClick}
                                            />}
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="cod_pod"
                                                value={this.state.form._loc.cod_pod}
                                                onChange={this.handleInputChange}
                                            />
                                        </div >
                                    </div >
                                    <div className="row recaptcha">
                                        <ReCaptcha
                                            ref={(el) => {
                                                this.recaptcha = el;
                                            }}
                                            size={window.screen.width < 360 ? 'compact' : 'normal'}
                                            data-theme="dark"
                                            render="explicit"
                                            sitekey={RECAPTCHA_KEY}
                                            onloadCallback={this.handleRecaptchaLoad}
                                            verifyCallback={this.handleRecaptchaToken}
                                        />
                                    </div>
                                    <div className="text-center offset-top">
                                        <Button
                                            type="submit"
                                            className="btn btn-primary col-12"
                                            onClick={this.handleNextClick}
                                        >
                                            Continuă
                                        </Button>
                                    </div>
                                </div >
                            </div >
                        </Form >
                    </div >
                </div >
            </div >
        );
    }
}

NLCValidation.propTypes = propTypes;
NLCValidation.defaultProps = defaultProps;

const mapStateToProps = state => ({
    eeProviders: getProviders(state, 'ee'),
    gazProviders: getProviders(state, 'gaz'),
    invoice: getInvoice(state),
    nlc: getNLC(state),
    nlcValidation: getNLCValidation(state),
    clientOptions: getClientOptions(state),
    session: getSession(state),
    counties: getItems(state),
    distributors: getDistributors(state),
    podInvoiceExamples: getInvoiceExamples(state, 'POD'),
    flow: getFlow(state).toLowerCase(),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    fetchOffers: offersActions.fetchItems,
    clearOffers: offersActions.clearCache,
    fetchInvoiceExamples,
    patchSession,
    setProvider,
    unsetProvider,
    checkNLC,
    validateNLC,
    clearNLC,
    showLoading,
    hideLoading,
    fetchDistributors,
    markAction,
    updateRegistrationInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(NLCValidation);
