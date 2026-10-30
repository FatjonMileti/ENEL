import React, { Component, useRef, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import _ from 'lodash';
import ModalOverlay from 'components/overlays/ModalOverlay';
import moment from 'moment';
import offerService from 'services/offer';
import pageService from 'services/page';

import * as ocrSelectors from 'store/ocr/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import { getSession, isCompleted } from 'store/session/selectors';
import { getItems as getDistributors } from 'store/distributors/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getFlow } from 'store/client/selectors';
import { getItems as getCampaigns } from 'store/campaigns/selectors';
import { getItems as getDiscounts } from 'store/discounts/selectors';
import { getItem as getVoucher } from 'store/voucher/selectors';

import { checkSigned } from 'store/documents/actions';
import { fetchAllItems as fetchDistributors } from 'store/distributors/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { setError, markAction, clearError } from 'store/client/actions';
import { validateVoucher } from 'store/voucher/actions';
import { validateCodeEnel } from 'store/cod_eneltel/actions';


import {
    patch as patchSession,
    createOffer,
} from 'store/session/actions';
import { showLoading, hideLoading } from '../../store/ui/actions';
import {
    fetchAllItems as fetchCampaigns,
    clearCache as clearCampaigns,
} from '../../store/campaigns/actions';

import {
    fetchAllItems as fetchDiscounts,
    clearCache as clearDiscounts,
} from '../../store/discounts/actions';

import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Select from 'components/validation/select';
import Button from 'components/validation/button';
import HeaderHero from 'components/heroes/HeaderHero';
import FormErrors from 'components/FormErrors';
import { required, codPostal, laterThanToday, max10, serieBuletin, tel, email, iban, integer, maxLength } from 'components/validation/rules';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';

import './MarketingOptions.scss';

const propTypes = {
    counties: PropTypes.array,
    cities: PropTypes.array,
    streets: PropTypes.array,
    streetTypes: PropTypes.object,
    campaigns: PropTypes.object.isRequired,
    discounts: PropTypes.object.isRequired,
    session: PropTypes.object,
    flow: PropTypes.string,
    patchSession: PropTypes.func.isRequired,
    createOffer: PropTypes.func.isRequired,
    fetchDistributors: PropTypes.func.isRequired,
    fetchCampaigns: PropTypes.func.isRequired,
    fetchDiscounts: PropTypes.func.isRequired,
    fetchCities: PropTypes.func.isRequired,
    fetchStreets: PropTypes.func.isRequired,
    clearCampaigns: PropTypes.func.isRequired,
    clearDiscounts: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    counties: [],
    cities: [],
    streets: [],
    streetTypes: {},
    flow: '',
    session: {
        client: {},
    },
};

class MarketingOptions extends Component {


    form = {
        email: this.getFromSession('email'),
        telefon: this.getFromSession('telefon'),
        acord_mk: this.getFromSession('acord_mk') || undefined,
        acord_part: this.getFromSession('acord_part') || undefined,
        acord_profil: this.getFromSession('acord_profil') || undefined,

        canal_email: this.getFromSession('canal_email') || false,
        canal_email_text: this.getFromSession('canal_email_text'),

        canal_sms: this.getFromSession('canal_sms') || false,
        canal_sms_text: this.getFromSession('canal_sms_text'),

        canal_telefon: this.getFromSession('canal_telefon') || false,
        canal_telefon_text: this.getFromSession('canal_telefon_text'),

        canal_posta: this.getFromSession('canal_posta') || false,
        canal_posta_adresa: {
            judet: this.getFromSessionAddress('judet'),
            localitate: this.getFromSessionAddress('localitate'),
            tip_artera: this.getFromSessionAddress('tip_artera') || 'STRADA',
            strada: this.getFromSessionAddress('strada'),
            nr_strada: this.getFromSessionAddress('nr_strada'),
            bloc: this.getFromSessionAddress('bloc'),
            scara: this.getFromSessionAddress('scara'),
            apartament: this.getFromSessionAddress('apartament'),
            etaj: this.getFromSessionAddress('etaj'),
            cod_postal: this.getFromSessionAddress('cod_postal'),
        },
        concursuri: [],
        discounts: [],
        isBringFriend: false,
        voucherCode: '',
        eneltelCode: '',
    };

    formErrors = {
        contract: [],
    };

    state = {
        voucherError: null,
        validationClicked: false,
        form: this.form,
        formErrors: this.formErrors,
        address: 'new',
        voucherCode: '',
        vouchers: [''],
        email: this.props.isCompleted ? !!this.getFromSession('email') : false,
        telefon: this.props.isCompleted ? !!this.getFromSession('telefon') : false,
        showMarketingOverlay: false,
        showInsuranceOverlay: false,
        showModalMaxVoucherOverlay: false,
        showModalVoucherErrorOverlay: false,
        showModalVoucherDataOverlay: false,
        showDiscountOverlay: false,
        insurance: {
            info: false,
            health: false,
            contact: false,
            annex: false,
            isValid: true,
        },
        isContinueCommunicationLoading: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchDistributors();
        this.props.fetchCampaigns();
        this.props.fetchDiscounts();

        this.props.markAction(pageService.actions.OPTIUNI_COMUNICARE.value);
        this.signedInterval = '';
    }

    componentWillUnmount() {
        this.props.clearCampaigns();
        this.props.clearDiscounts();
        clearInterval(this.signedInterval);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEmpty(this.props.campaigns) && _.isEmpty(this.state.form.concursuri)) {
            this.setState({
                ...this.state,
                form: {
                    ...this.state.form,
                    concursuri: _.map(this.props.campaigns, item => ({
                        id: item.id,
                        acord_concurs: '0',
                    })),
                },
            });
        }

        if (prevProps.discounts !== this.props.discounts && _.size(this.props.discounts) === 1 && _.isEmpty(this.state.form.discounts)) {
            const discounts = [];
            _.map(this.props.discounts, (item) => {
                discounts.push(item.DiscountID);
            });

            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                ...this.state,
                form: {
                    ...this.state.form,
                    discounts,
                },
            });
        }
    }

    getFromSession(property) {
        if (this.props.session[`${this.props.flow}_contact`]) {
            return this.props.session[`${this.props.flow}_contact`][property] || '';
        }

        return '';
    }

    getFromSessionAddress(property) {
        if (this.props.session[`${this.props.flow}_contact`] && this.props.session[`${this.props.flow}_contact`].canal_posta_adresa) {
            return this.props.session[`${this.props.flow}_contact`].canal_posta_adresa[property] || '';
        }

        return '';
    }

    getFilteredCities() {
        if (this.state.form.canal_posta_adresa.judet) {
            return _.filter(this.props.cities, city => city.judet == this.state.form.canal_posta_adresa.judet);
        }
    }

    getFilteredStreets() {
        if (this.state.form.canal_posta_adresa.localitate) {
            const city = _.find(this.props.cities, city => city.internal_id == this.state.form.canal_posta_adresa.localitate);

            if (city) {
                return _.filter(this.props.streets, street => street.localitate == city.denumire);
            }
        }
    }

    getContactChannel() {
        return this.state.telefon ? 'SMS' : 'EMAIL';
    }

    handleInsuranceChange(e) {
        this.setState({
            insurance: {
                ...this.state.insurance,
                [e.target.name]: e.target.checked,
            },
        });
    }

    onCheckboxChange(e) {
        const { form } = this.state;
        form[e.target.name] = e.target.checked;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleCheckboxChange(e) {
        const { form } = this.state;
        form[e.target.name] = e.target.checked;

        if (!_.isNil(this.props.session.contract_type === 'b2b' ? this.props.session.company : this.props.session.client)) {
            let { email, telefon_mobil } = this.props.session.contract_type === 'b2b' ? this.props.session.company.data : this.props.session.client;

            const invoice = this.props.session[`${this.props.flow}_factura`];
            if (invoice.email) email = invoice.email;

            switch (e.target.name) {
                case 'canal_email':
                    form[`${e.target.name}_text`] = e.target.checked ? email : '';
                    break;
                case 'canal_sms':
                    form[`${e.target.name}_text`] = e.target.checked ? telefon_mobil : '';
                    break;
                case 'canal_telefon':
                    form[`${e.target.name}_text`] = e.target.checked ? telefon_mobil : '';
                    break;
                default:
                    break;
            }
        }

        if (!form.acord_mk && !form.acord_part && !form.acord_profil) {
            _.each(form, (element, key, form) => {
                if (key.startsWith('canal_')) {
                    if (key.endsWith('text')) {
                        form[key] = '';
                    } else {
                        form[key] = false;
                    }
                }
            });
        }

        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleAddressCheckboxChange(e) {
        if (this.state.form.canal_posta) {
            this.handleAddressChange({ target: { value: 'new' } });
        } else {
            this.handleAddressChange({ target: { value: `${this.props.flow}_loc` } });
        }

        this.handleCheckboxChange(e);
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleAddressChange(e) {
        this.setState({
            address: e.target.value,
            form: _.extend(this.state.form, {
                canal_posta_adresa: _.extend(
                    this.state.form.canal_posta_adresa,
                    offerService.getAddressBySelect(this.props.session, 'new')
                ),
            }),
        }, async () => {
            const addressData = offerService.getAddressBySelect(this.props.session, this.state.address);

            if (this.state.form.address != 'new') {
                await this.props.fetchCities(addressData.judet);
                await this.props.fetchStreets(addressData.tip_artera, addressData.localitate);
            }

            this.setState({
                form: _.extend(this.state.form, {
                    canal_posta_adresa: _.extend(this.state.form.canal_posta_adresa, addressData),
                }),
            });
        });
    }

    handleCountyChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                canal_posta_adresa: _.extend(this.state.form.canal_posta_adresa, {
                    judet: e.target.value,
                    localitate: '',
                    strada: '',
                }),
            }),
        });
        this.props.fetchCities(e.target.value);
    }

    handleCityChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                canal_posta_adresa: _.extend(this.state.form.canal_posta_adresa, {
                    localitate: e.target.value,
                    strada: '',
                }),
            }),
        });
        this.props.fetchStreets(this.state.form.canal_posta_adresa.tip_artera, e.target.value);
    }

    handleAddressInputChange(e) {
        const data = {};
        data[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, {
                canal_posta_adresa: _.extend(this.state.form.canal_posta_adresa, data),
            }),
        });
    }

    handleEmailSelection(e) {
        e.preventDefault();
        let { email } = this.props.session.contract_type === 'b2b' ? this.props.session.company.data : this.props.session.client;

        const invoice = this.props.session[`${this.props.flow}_factura`];
        if (invoice.email) email = invoice.email;

        this.setState({
            email: true,
            telefon: false,
            form: _.extend(this.state.form, {
                email,
                telefon: '',
            }),
        });
    }

    handlePhoneSelection(e) {
        e.preventDefault();
        const { telefon_mobil } = this.props.session.contract_type === 'b2b' ? this.props.session.company.data : this.props.session.client;

        this.setState({
            telefon: true,
            email: false,
            form: _.extend(this.state.form, {
                telefon: telefon_mobil,
                email: '',
            }),
        });
    }

    showMarketingOverlay(e) {
        e.preventDefault();
        this.setState({
            showMarketingOverlay: true,
        });
    }

    showInsuranceOverlay(e) {
        if (e) e.preventDefault();
        this.setState({
            showInsuranceOverlay: true,
        });
    }

    noErrors() {
        if (!this.state.insurance.isValid) return false;
        if (!_.isNil(_.find(this.state.formErrors, section => section.length > 0))) return false;
        return !(this.form.getChildContext()._errors.length > 0);
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
    }

    validateInsuranceAgreement() {
        return new Promise((resolve) => {
            const { info, health, contact } = this.state.insurance;
            const offer = this.props.session[`${this.props.flow}_serviciu`];
            this.setState({
                insurance: {
                    ...this.state.insurance,
                    isValid: !offer.tipOfertaAsigurat || (info && health && contact),
                },
            }, () => {
                if (!this.state.insurance.isValid) {
                    this.showInsuranceOverlay();
                }
                resolve();
            });
        });
    }

    validateSendContract() {
        const { formErrors } = this.state;
        if (!this.state.form.email && !this.state.form.telefon) {
            const err = 'Trebuie sa alegi modul de transmitere al contractului.';
            formErrors.contract.push(err);
        }
        this.setState({ formErrors });
    }

    validateMarketingCheckboxSelection() {
        if (this.state.form.acord_profil === undefined || this.state.form.acord_mk === undefined || this.state.form.acord_part === undefined) {
            const { formErrors } = this.state;
            const err = 'Trebuie sa bifezi optiunile de comunicare marketing de mai jos pentru a continua procesul.'
            formErrors.contract.push(err);
            this.setState({ formErrors });
        }
    }

    validateMarketingChannel() {
        const { formErrors } = this.state;
        if ((this.state.form.acord_mk || this.state.form.acord_part || this.state.form.acord_profil)
            && !this.state.form.canal_sms
            && !this.state.form.canal_telefon
            && !this.state.form.canal_email
            && !this.state.form.canal_posta) {
            const err = 'Trebuie să alegi cel puțin un canal de comunicare în scopuri de marketing.';
            formErrors.contract.push(err);
        }
        this.setState({ formErrors });
    }

    goToNextPage() {
        pageService.scrollToTop();
        if (this.props.session.backoffice) {
            browserHistory.push(pageService.links.backoffice);
        } else {
            this.props.markAction(pageService.actions.GENERARE_DOCUMENTE.value);
            browserHistory.push(pageService.links['contract-review']);
        }
    }

    async handleNextClick(e) {
        e.preventDefault();
        this.props.clearError();
        if (this.state.isContinueCommunicationLoading) return false;

        this.setState({
            isContinueCommunicationLoading: true,
        });

        this.resetFormErrors();
        this.validateMarketingCheckboxSelection()
        this.form.validateAll();
        await this.validateInsuranceAgreement();
        this.validateSendContract();
        this.validateMarketingChannel();

        if (this.props.isCompleted) {
            this.goToNextPage();
        } else if (this.noErrors()) {
            await this.props.patchSession({ _contact: this.state.form, voucher: { voucherCode: this.props.voucher != null ? this.props.voucher.voucher_id : null, isFriend: this.state.form.isBringFriend, eneltel: this.state.form.isBringFriend ? this.state.form.eneltelCode : null } });
            const {session} = this.props;

            const {ee_factura, gaz_factura} = session;

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 13,
                'contract_delivery':this.state.form.email ? "email"  :"phone",
                'coupon': "",
                'comm_method': session.type === "EE" ? ee_factura.mod_corespondenta : gaz_factura.mod_corespondenta,
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });
            try {
                this.props.showLoading();
                await this.props.createOffer(this.getContactChannel());
                this.goToNextPage();
            } catch (e) {
                if (e.message !== 'SOAP_DOCOUT') {
                    if (e.message.indexOf('CRM') !== -1) {
                        const err = 'Contractul nu a putut fi finalizat.';
                        this.props.setError(err);
                    } else {
                        const err = e.message;
                        this.props.setError(e.message);
                    }
                    this.props.hideLoading();
                } else {
                    this.props.showLoading();

                    const currentSess = this.props.session;
                    const self = this;

                    this.signedInterval = setInterval(async () => {
                        const signed = await self.props.checkSigned(currentSess.type);
                        if (typeof signed !== 'undefined' && signed.length > 0) {
                            clearInterval(self.signedInterval);
                            self.props.hideLoading();
                            self.props.goToNextPage();
                        }
                    }, 5000);
                }
            }
        } else {
            pageService.scrollToError();
        }
        this.setState({
            isContinueCommunicationLoading: false,
        });
    }

    validateVoucher = index => async (e) => {
        e.preventDefault();

        this.form.validateAll();
        if (!this.state.form.voucherCode && this.state.form.voucherCode === '') {

            this.setState({
                voucherError: {
                    error: 'Este necesar codul voucherului.'
                },
                showModalVoucherErrorOverlay: true,
            });
            return;
        }

        if (!this.state.form.eneltelCode && this.state.form.eneltelCode === '' && this.state.form.isBringFriend) {
            this.setState({
                voucherError: {
                    error: 'Te rog completeaza campul obligatoriu Electel.'
                },
                showModalVoucherErrorOverlay: true,
            });
            return;
        }

        const eneltel = this.state.form.eneltelCode;
        const vc = this.state.form.voucherCode;
        const product = this.props.session[`${this.props.flow}_serviciu`];
        const judet = this.props.session['judet'];
        const cityId = this.props.session[`${this.props.flow}_loc`]['localitate'];
        await this.props.validateVoucher(vc, product.tip, product.denumire, product.seg, judet, cityId, this.state.form.isBringFriend, eneltel);
        if (this.props.voucher.error) {
            this.state.voucherError = this.props.voucher;
            this.setState({
                showModalVoucherErrorOverlay: true,
            });
        } else {
            this.setState({
                showModalVoucherDataOverlay: true,
            });
        }

        this.setState({
            validationClicked: false
        });
    }

    validateEneltel = index => (e) => {
        e.preventDefault();
        const eneltel = this.state.form[`eneltel`];
        this.props.validateEneltel(eneltel);
    }

    checkIfreachedMaxOfVouchers() {
        // check if you have arrived the limits of the vouchers
        return (
            <Fragment>
                <ModalOverlay
                    show={this.state.showModalMaxVoucherOverlay}
                    onClose={this.handleModalOverlayDismiss}
                >
                </ModalOverlay>
                <div className={`PlanList ${this.state.show ? 'show' : ''}`}>
                    <div className="container main-area container-large">
                        <div className="row">
                            <div className="col-md-12 offset-md-1 card-set-wrapper transition-3s">
                                <p className="disclaimer">
                                    You reached max number of voucher
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }


    showVoucherError(voucher) {
        if (voucher)
            return (
                <ModalOverlay
                    show={this.state.showModalVoucherErrorOverlay}
                >
                    <ConfirmOverlay
                        title=""
                        description={
                            <div className="container main-area container">
                                {voucher.error}
                            </div>
                        }
                        dismissLabel="OK"
                        onDismiss={this.handleOverlayDismiss}
                        noConfirm
                        show={this.state.showModalVoucherErrorOverlay}
                        noLogo
                        noFixed
                    />
                </ModalOverlay>
            );
    }


    showVoucherData(voucher) {
        // check if you have arrived the limits of the vouchers
        if (voucher)
            return (
                <ModalOverlay
                    show={this.state.showModalVoucherDataOverlay}
                >
                    <ConfirmOverlay
                        title=""
                        description={
                            <div className="container main-area container">
                                <div className="description">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <b>Voucher Name:</b>
                                        </div>
                                        <div className="col-md-3">{voucher.voucher_name}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <b>Voucher Code:</b>
                                        </div>
                                        <div className="col-md-3">{voucher.voucher_code}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <b>Valabilitate:</b>
                                        </div>
                                        <div className="col-md-3">
                                            {moment(voucher.voucher_enddate).format('DD.MM.YYYY')}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <b>Status:</b>
                                        </div>
                                        <div className="col-md-3">{voucher.voucher_status}</div>
                                    </div>
                                </div>
                            </div>
                        }
                        dismissLabel="OK"
                        onDismiss={this.handleOverlayDismiss}
                        noConfirm
                        show={this.state.showModalVoucherDataOverlay}
                        noLogo
                        noFixed
                    />
                </ModalOverlay>
            );
    }

    checkIfReachedMaxOfBringFriends() {
        // check if you have arrived the limits of friends that we can bring
        return (
            <Fragment>
                <ModalOverlay
                    show={this.state.showModalMaxBringFrinedsOverlay}
                    onClose={this.handleModalOverlayDismiss}
                >
                </ModalOverlay>
            </Fragment>
        );
    }

    handleOverlayDismiss(e) {
        e.preventDefault();
        this.setState({
            showMarketingOverlay: false,
            showInsuranceOverlay: false,
            showDiscountOverlay: false,
            showModalVoucherErrorOverlay: false,
            showModalVoucherDataOverlay: false,
        });
    }

    handleCampaignCheckboxChange(e, campaign) {
        e.preventDefault();
        const index = _.findIndex(this.state.form.concursuri, item => item.id == campaign.id);
        const concursuri = JSON.parse(JSON.stringify(this.state.form.concursuri));
        concursuri[index].acord_concurs = e.target.checked ? '1' : '0';
        this.setState({
            ...this.state,
            form: {
                ...this.state.form,
                concursuri,
            },
        });
    }

    isCampaignChecked(campaign) {
        if (this.state.form.concursuri && this.state.form.concursuri.length > 0) {
            const result = this.state.form.concursuri.find(item => item.id == campaign.id);
            if (result) {
                return result.acord_concurs == '1';
            }
        }

        return false;
    }

    renderCampaigns() {
        return _.map(this.props.campaigns, campaign => (
            <div key={campaign.id} className="row">
                <div className="mb-3 col-md-12 checkbox-acord">
                    <div className="custom-control custom-checkbox">
                        <input key={`${campaign.id}-${this.isCampaignChecked(campaign)}`} type="checkbox" className="custom-control-input" id={`formCustomCheckbox116-${campaign.id}`} name={`campaign-${campaign.id}`} checked={this.isCampaignChecked(campaign)} onChange={e => this.handleCampaignCheckboxChange(e, campaign)} />
                        <label className="custom-control-label" htmlFor={`formCustomCheckbox116-${campaign.id}`}>
                            Sunt de acord cu participarea la campania <a href={`${campaign.regulament || '#'}`} target="_blank" rel="noreferrer">{campaign.denumire}</a>
                        </label>
                    </div>
                </div>
            </div>
        ));
    }

    isDiscountChecked(id) {
        const { session, flow } = this.props;
        const { discounts } = this.state.form;
        const sessionDiscounts = session[`${flow}_contact`] ? session[`${flow}_contact`].discounts : [];
        return sessionDiscounts.includes(id) || discounts.includes(id);
    }

    handleDiscountCheckboxChange(e, id) {
        let { discounts } = this.state.form;

        if (e.target.checked && !discounts.includes(id)) {
            discounts.push(id);
        } else {
            discounts = discounts.filter(d => d !== id);
        }
        this.setState({
            ...this.state,
            form: {
                ...this.state.form,
                discounts,
            },
        });

    }

    renderDiscounts() {
        return _.map(this.props.discounts, discount => (
            <div key={`${discount.DiscountID}-discount`} className="row">
                <div className="mb-3 col-md-12 checkbox-acord">
                    <div className="custom-control custom-checkbox">
                        <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`formCustomCheckbox117-${discount.DiscountID}`}
                            name={`discount-${discount.DiscountID}`}
                            checked={this.isDiscountChecked(discount.DiscountID)}
                            onChange={e => this.handleDiscountCheckboxChange(e, discount.DiscountID)}
                        />
                        <label className="custom-control-label" htmlFor={`formCustomCheckbox117-${discount.DiscountID}`}>
                            {discount.DiscountName} (<a className="description-link" href="#" onClick={this.showDiscountOverlay}>detalii</a>)
                        </label>
                    </div>
                </div>
            </div>
        ));
    }

    showDiscountOverlay(e) {
        this.setState({
            showDiscountOverlay: true,
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

    renderVoucher(voucher, index) {
        return (<div><fieldset>
            <div className="order-md-1 col-md-12">
                <h4 className="mb-3">Vouchere</h4>
                <div className="row">
                    <div className={this.state.form.isBringFriend ? "col-md-4" : 'col-md-8'}>
                        <Input
                            name={`voucherCode`}
                            value={this.state.form.voucherCode}
                            onChange={this.handleInputChange}
                            className="form-control"
                            placeholder="VOUCHER CODE"
                            containerClass=""
                            type="text"
                        />
                    </div>
                    {this.state.form.isBringFriend ? <div className="col-md-4">
                        <Input
                            name={`eneltelCode`}
                            value={this.state.form.eneltelCode}
                            onChange={this.handleInputChange}
                            className="form-control"
                            placeholder="ELECTEL"
                            containerClass=""
                            type="text"
                        />
                    </div> : <div></div>}
                    <div className="col-md-4">
                        <Button type="button" className="btn btn-primary btn-full-width" onClick={this.validateVoucher(index)} loading={this.state.isContinueCommunicationLoading}>
                            Valideaza
                        </Button>
                    </div>
                </div>
            </div>

            <div className="order-md-1 col-md-12">
                <div className='row'>
                    <div className="col-md-12">
                        <div className="custom-control custom-checkbox ">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="add-a-friend-checkbox"
                                name="isBringFriend"
                                checked={this.state.form.isBringFriend}
                                onChange={this.handleCheckboxChange}

                            />
                            <label className="custom-control-label" htmlFor="add-a-friend-checkbox">Ofera voucher unui prieten (completeaza codul ElecTel al prietenului)</label></div>
                    </div>
                </div>
            </div>

        </fieldset>
            {/* {this.props.voucher.voucher_id ? this.renderEneltel(null, index) : <div></div>} */}
        </div >
        );
    }

    renderAddress() {
        if (this.state.form.canal_posta) {
            const counties = _.map(this.props.counties, v => ({ value: v.denumire, label: v.denumire }));
            const cities = _.map(this.getFilteredCities(), v => ({ value: v.internal_id, label: v.denumire }));
            const streetTypes = _.map(this.props.streetTypes, v => ({ value: v.cod, label: v.cod }));
            const streets = _.map(this.getFilteredStreets(), v => ({ value: v.internal_id, label: v.denumire }));

            return (
                <div className="marketing-address">
                    <div className="row client-autocomplete">
                        <Select
                            name="judet"
                            label="Județ"
                            placeholder="Alege"
                            value={this.state.form.canal_posta_adresa.judet}
                            className="form-control"
                            containerClass="mb-3 col-md-6"
                            validations={[]}
                            autocomplete
                            onSelect={this.handleCountyChange}
                            items={counties}
                        />
                        <Select
                            name="localitate"
                            label="Localitate"
                            placeholder="Alege"
                            value={this.state.form.canal_posta_adresa.localitate}
                            className="form-control"
                            containerClass="mb-3 col-md-6"
                            validations={[]}
                            autocomplete
                            onSelect={this.handleCityChange}
                            items={cities}
                        />
                    </div>
                    <div className="row client-autocomplete">
                        <Select
                            name="tip_artera"
                            label="Tip stradă"
                            placeholder="Alege"
                            value={this.state.form.canal_posta_adresa.tip_artera}
                            className="form-control"
                            containerClass="mb-3 col-md-6"
                            validations={[]}
                            onSelect={this.handleAddressInputChange}
                            items={streetTypes}
                        />
                        <Select
                            name="strada"
                            label="Stradă"
                            placeholder="Alege"
                            value={this.state.form.canal_posta_adresa.strada}
                            className="form-control"
                            containerClass="mb-3 col-md-6"
                            validations={[]}
                            autocomplete
                            onSelect={this.handleAddressInputChange}
                            items={streets}
                        />
                    </div>
                    <div className="row">
                        <Input
                            name="nr_strada"
                            label="Număr"
                            value={this.state.form.canal_posta_adresa.nr_strada}
                            onChange={this.handleAddressInputChange}
                            className="form-control"
                            containerClass="mb-3 col-md-4"
                            validations={[value => maxLength(value, 15)]}
                        />
                        <Input
                            name="bloc"
                            label="Bloc"
                            value={this.state.form.canal_posta_adresa.bloc}
                            onChange={this.handleAddressInputChange}
                            className="form-control"
                            containerClass="mb-3 col-md-4"
                            validations={[value => maxLength(value, 10)]}
                        />
                        <Input
                            name="scara"
                            label="Scară"
                            value={this.state.form.canal_posta_adresa.scara}
                            onChange={this.handleAddressInputChange}
                            className="form-control"
                            containerClass="mb-3 col-md-4"
                            validations={[]}
                        />
                    </div>
                    <div className="row">
                        <Input
                            name="etaj"
                            label="Etaj"
                            value={this.state.form.canal_posta_adresa.etaj}
                            onChange={this.handleAddressInputChange}
                            className="form-control"
                            containerClass="mb-3 col-md-4"
                            validations={[]}
                        />
                        <Input
                            name="apartament"
                            label="Apartament"
                            value={this.state.form.canal_posta_adresa.apartament}
                            onChange={this.handleAddressInputChange}
                            className="form-control"
                            containerClass="mb-3 col-md-4"
                            validations={[value => maxLength(value, 15)]}
                        />
                        <Input
                            name="cod_postal"
                            label="Cod poștal"
                            value={this.state.form.canal_posta_adresa.cod_postal}
                            onChange={this.handleAddressInputChange}
                            className="form-control"
                            containerClass="mb-3 col-md-4"
                            validations={[codPostal, integer]}
                            type="number"
                        />
                    </div>
                </div>
            );
        }
    }

    renderMarketingOptions() {
        const addresses = [{
            value: `${this.props.flow}_loc`,
            label: 'Aceeași cu cea de corespondența',
        },
        {
            value: 'new',
            label: 'Aceeași cu cea de corespondența',
        }];
        // ,{
        //     value: `${this.props.flow}_loc`,
        //     label: 'Aceeași cu cea de consum',
        // }, {
        //     value: 'client',
        //     label: 'Aceeași cu cea de domiciliu',
        // }, {
        //     value: 'new',

        const enableCommunication = this.state.form.acord_mk || this.state.form.acord_part || this.state.form.acord_profil;

        return (
            <span>
                <div className="row">
                    <div className="mb-3 col-md-12">
                        <div className="custom-control custom-checkbox ">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="formCustomCheckbox119"
                                name="canal_email"
                                checked={this.state.form.canal_email}
                                onChange={this.handleCheckboxChange}
                                disabled={!enableCommunication}
                            />
                            <label className="custom-control-label" htmlFor="formCustomCheckbox119">Comunicare prin e-mail</label>
                            <Input
                                name="canal_email_text"
                                value={this.state.form.canal_email_text}
                                onChange={this.handleInputChange}
                                className="form-control"
                                placeholder="Email"
                                containerClass=""
                                validations={[email]}
                                type="email"
                                disabled={!enableCommunication}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="mb-3 col-md-12">
                        <div className="custom-control custom-checkbox ">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="formCustomCheckbox120"
                                name="canal_sms"
                                checked={this.state.form.canal_sms}
                                onChange={this.handleCheckboxChange}
                                disabled={!enableCommunication}
                            />
                            <label className="custom-control-label" htmlFor="formCustomCheckbox120">Comunicare prin SMS</label>
                            <Input
                                name="canal_sms_text"
                                value={this.state.form.canal_sms_text}
                                onChange={this.handleInputChange}
                                className="form-control"
                                placeholder="Telefon"
                                containerClass=""
                                validations={[tel]}
                                type="tel"
                                disabled={!enableCommunication}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="mb-3 col-md-12">
                        <div className="custom-control custom-checkbox ">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="formCustomCheckbox121"
                                name="canal_telefon"
                                checked={this.state.form.canal_telefon}
                                onChange={this.handleCheckboxChange}
                                disabled={!enableCommunication}
                            />
                            <label className="custom-control-label" htmlFor="formCustomCheckbox121">Comunicare prin telefon</label>
                            <Input
                                name="canal_telefon_text"
                                value={this.state.form.canal_telefon_text}
                                onChange={this.handleInputChange}
                                className="form-control"
                                placeholder="Telefon"
                                containerClass=""
                                validations={[tel]}
                                type="tel"
                                disabled={!enableCommunication}
                            />
                        </div>
                    </div>
                </div>
                <div className="row client-autocomplete">
                    <div className="mb-3 col-md-12">
                        <div className="custom-control custom-checkbox ">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="formCustomCheckbox122"
                                name="canal_posta"
                                checked={this.state.form.canal_posta}
                                onChange={this.handleAddressCheckboxChange}
                                disabled={!enableCommunication}
                            />
                            <label className="custom-control-label" htmlFor="formCustomCheckbox122">Comunicare prin poștă</label>
                            <Select
                                name="address"
                                placeholder="Alege"
                                value={this.state.address}
                                className="form-control"
                                containerClass=""
                                validations={[]}
                                onSelect={this.handleAddressChange}
                                items={_.map(addresses, v => ({ value: v.value, label: v.label }))}
                                disabled// {!enableCommunication || !this.state.form.canal_posta}
                            />
                        </div>
                    </div>
                </div>
                {/* {this.renderAddress()} */}
            </span>
        );
    }

    renderInsuranceOptions() {
        const offer = this.props.session[`${this.props.flow}_serviciu`];
        if (offer.tipOfertaAsigurat) {
            return (
                <fieldset>
                    <div className="order-md-1 col-md-12">
                        <h4 className="mb-3">Prelucrarea datelor cu caracter personal și comunicare electronică cu Generali România</h4>
                        <div className="row">
                            <div className="col-md-12">
                                <span className="marketing-disclaimer">Mai multe detalii privind prelucrarea datelor cu caracter personal în cadrul derulării contractului pentru produsul {offer.denumire} găsiți <a className="description-link" href="https://www.generali.ro/enel/enel-protect" target="_blank" rel="noopener noreferrer">aici</a>.</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="mb-3 col-md-12 checkbox-acord">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="formCustomCheckbox201" name="info" checked={this.state.insurance.info} onChange={this.handleInsuranceChange} />
                                    <label className="custom-control-label" htmlFor="formCustomCheckbox201">
                                        <span>
                                            Ținând cont de specificul asigurării de care voi beneficia, sunt
                                            în mod expres de acord ca Generali să prelucreze{' '}
                                            <b>DATELE MELE PRIVIND PRIVIND STAREA DE SĂNĂTATE,</b> date
                                            absolut necesare pentru prestarea acestor servicii de asigurare
                                            specifice.
                                            <b>Sunt, de asemenea, de acord </b>să împuternicesc Generali să
                                            întreprindă orice fel de investigații, să ceară documente
                                            medicilor curanți, care pot duce la evaluarea completă a stării
                                            mele de sănătate. În acest scop orice medic, spital,
                                            policlinica, sau orice alta instituție medicală sau persoană
                                            care deține date sau informații și/sau documente despre starea
                                            mea de sănătate să furnizeze, la solicitarea scrisă a Generali,
                                            informații complete, referitoare la orice boală, accident,
                                            tratament, examinare, consultație, spitalizare etc pe care am
                                            efectuat-o. În cazul producerii unui Eveniment / Risc asigurat,
                                            împuternicesc Generali să facă toate demersurile pentru
                                            obținerea documentelor necesare stabilirii întinderii obligației
                                            de plată a despabubirii, eliberând de secretul profesional atât
                                            pe medicii care m-au consultat / tratat, cât și orice Insitutie
                                            publică sau privată care deține informații cu privire la starea
                                            mea de sănătate și la istoricul meu medical, atât în timpul
                                            vieții, cât și ulterior, în situația producerii riscului de
                                            Deces din orice cauză. Am înțeles că, dacă nu îmi voi exprima
                                            acordul pentru prelucrarea datelor privind starea de sănătate,
                                            Generali nu va putea executa contractul de asigurare în care
                                            sunt parte sau ale cărui efecte se produc față de mine, inclusiv
                                            dar fară a se limita la activitatea de plată a despăgubirilor.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="mb-3 col-md-12 checkbox-acord">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="formCustomCheckbox202" name="health" checked={this.state.insurance.health} onChange={this.handleInsuranceChange} />
                                    <label className="custom-control-label" htmlFor="formCustomCheckbox202">
                                        <span>
                                            <b>Sunt în mod expres de acord </b> să mi se comunice și să
                                            primesc de la Generali informări despre serviciile și produsele
                                            sale, inclusiv pentru imbunatirea acestora, beneficii pe care să
                                            le accesez, oferte promoționale sau oportunități de asigurare
                                            (SCOP DE MARKETING).
                                        </span></label>
                                </div>
                            </div>
                        </div>
                        <div className="group-name">
                            INFORMAREA ASIGURATORULUI PRIVIND CUNOAȘTEREA CLIENTELEI
                        </div>
                        <div className="row">
                            <div className="mb-3 col-md-12 checkbox-acord">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="formCustomCheckbox203" name="contact" checked={this.state.insurance.contact} onChange={this.handleInsuranceChange} />
                                    <label className="custom-control-label" htmlFor="formCustomCheckbox203">
                                        <span>
                                            <b>Sunt persoană expusă public</b> SAU membru al familiei unei
                                            persoane expuse public SAU asociat apropiat al unei persoane
                                            expuse public, în acord cu Legea 129/2019 pentru prevenirea şi
                                            combaterea spălării banilor şi finanţării terorismului și cu
                                            Norma de aplicare. <b>EXPLICAȚII:</b> Prin persoane expuse
                                            public se înțeleg persoanele fizice care exercită sau au
                                            exercitat funcții publice importante (inclusiv la nivel
                                            comunitar sau internațional). După împlinirea unui termen de un
                                            an de la data la care persoana expusă public a încetat să mai
                                            ocupe funcția publică importantă respectivă, nu se mai supune
                                            obligației de informare de mai sus nici ea, nici membrii
                                            familiei și nici asociații apropiați.
                                        </span></label>
                                </div>
                            </div>
                        </div>
                        <div className="group-name">
                            ACORDUL PERSOANEI PROPUSE SPRE ASIGURARE PRIVIND INCLUDEREA ÎN ASIGURAREA DE
                            GRUP
                        </div>
                        <div className="text-extra">
                            <div className="col-md-12">
                                Prin apăsarea butonui CONTINUĂ sunt în mod expres de acord cu încheierea
                                asigurării (a Contractului de asigurare) pentru următoarele riscuri:
                                <ul className="unordered-list">
                                    <li> Pierderea Involuntară a Locului de Muncă (Șomaj), </li>
                                    <li> Invaliditatea Permanentă Totală din orice cauză și </li>
                                    <li>
                                        {' '}
                                        Deces din orice cauză, ca beneficiu gratuit oferit de PPC
                                        Energie /PPC Energie parte din pachetul{' '}
                                        {offer.denumire}.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* <div className="row"> */}
                        {/*    <div className="mb-3 col-md-12 checkbox-acord"> */}
                        {/*        <div className="custom-control custom-checkbox"> */}
                        {/*            <input type="checkbox" className="custom-control-input" id="formCustomCheckbox204" name="annex" checked={this.state.insurance.annex} onChange={this.handleInsuranceChange} /> */}
                        {/*            <label className="custom-control-label" htmlFor="formCustomCheckbox204">Declar că AM PRIMIT ȘI AM ÎNȚELES 1(un) exemplar al Anexei intitulată <a href="https://www.generali.ro/wp-content/uploads/2019/04/Anexa-1-bis-Informare_Clienti_Transfer-date-Generali_site-Generali.pdf" target="_blank" rel="noopener noreferrer">"Informare privind prelucrarea datelor cu caracter personal în cadrul derulării contractului pentru produsul {offer.denumire}"</a>.</label> */}
                        {/*        </div> */}
                        {/*    </div> */}
                        {/* </div> */}
                    </div>
                </fieldset>
            );
        }
    }

    resetChannelCheckBoxes() {
        const { form } = this.state;
        if (!form.acord_mk && !form.acord_part && !form.acord_profil) {
            _.each(form, (element, key, form) => {
                if (key.startsWith('canal_')) {
                    if (key.endsWith('text')) {
                        form[key] = '';
                    } else {
                        form[key] = false;
                    }
                }
            });
        }
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleMarketingAgreeCheckBox() {
        this.setState({
            form: {
                ...this.state.form,
                acord_mk: (this.state.form.acord_mk === undefined || this.state.form.acord_mk === false) ? true : undefined
            },
        }, this.resetChannelCheckBoxes)
    }

    handleMarketingDisagreeCheckBox() {
        this.setState({
            form: {
                ...this.state.form,
                acord_mk: (this.state.form.acord_mk === undefined || this.state.form.acord_mk === true) ? false : undefined
            },
        }, this.resetChannelCheckBoxes)
    }

    handleMarketingContactDataAgreeCheckBox() {
        this.setState({
            form: {
                ...this.state.form,
                acord_part: (this.state.form.acord_part === undefined || this.state.form.acord_part === false) ? true : undefined
            },
        }, this.resetChannelCheckBoxes)
    }

    handleMarketingContactDataDisagreeCheckBox() {
        this.setState({
            form: {
                ...this.state.form,
                acord_part: (this.state.form.acord_part === undefined || this.state.form.acord_part === true) ? false : undefined
            },
        }, this.resetChannelCheckBoxes)
    }

    handleMarketingProfileaAgreeCheckBox() {
        this.setState({
            form: {
                ...this.state.form,
                acord_profil: (this.state.form.acord_profil === undefined || this.state.form.acord_profil === false) ? true : undefined
            },
        }, this.resetChannelCheckBoxes)
    }

    handleMarketingProfileDisagreeCheckBox() {
        this.setState({
            form: {
                ...this.state.form,
                acord_profil: (this.state.form.acord_profil === undefined || this.state.form.acord_profil === true) ? false : undefined
            },
        }, this.resetChannelCheckBoxes)
    }

    render() {
        const offer = this.props.session[`${this.props.flow}_serviciu`];

        const marketingOverlayContent = (
            <div>
                <b>Activitățile de marketing direct pot fi desfășurate atât de către PPC, cât și de către partenerii PPC și pot presupune transmiterea de materiale promoționale și/sau informații/comunicări referitoare la</b>
                <br /><br />(i) prestarea de servicii/furnizarea de bunuri care pot avea legătură cu activitatea PPC, respectiv furnizarea de energie electrică și/sau gaze natural, dar și furnizarea altor servicii conexe/similare, inclusiv utilizarea aplicațiilor/serviciilor online,
                <br /><br />(ii) organizarea și desfășurarea de evenimente în scopul fidelizării, inclusiv posibilitatea acordării anumitor premii (spre exemplu, dar fără a se limita la: bunuri, excursii, discounturi și reduceri, alte asemenea beneficii),
                <br /><br />(iii) desfășurarea unor evenimente care promovează imaginea PPC, încurajează/susține desfășurarea unor evenimente similare, inclusiv în ceea ce privește promovarea și apărarea drepturilor omului, promovarea metodelor clasice sau alternative de educație, înființarea/ dezvoltarea instituțiilor/organizațiilor/asociațiilor de învățământ, organizarea și desfășurarea de evenimente culturale/educaționale/artistice, inclusiv acțiuni caritabile/donații/sponsorizări, precum și dezvoltarea și implementarea de activități antropice sau de dezvoltare durabilă.
                <br /><br />Activităţile de marketing direct presupun desfăşurarea unor operaţiuni de prelucrare a datelor cu caracter personal, operaţiuni care implică transferul datelor comunicate de dumneavoastră atât către alte companii din grupul PPC, cât şi către alţi parteneri PPC, in funcţie de opţiunea aleasă de dumneavoastră. In scopul realizarii activitaţilor de marketing direct, precizăm că datele comunicate de dumneavoastra prin prezentul formular sunt transferate în spaţiul Uniunii Europene şi/sau în afara acestuia prin intermediul instrumentelor juridice şi garanţiilor adecvate reglementate de Comisia Europeana şi/sau de către alte autoritaţi naţionale, respectiv în alte state care să asigure un nivel adecvat de protecţie a datelor.
                <br /><br /><b>Astfel, în cazul în care sunteți interesat(ă) să primiți informații/comunicări în scop de marketing direct, vă rugăm să completați secțiunea dedicată de mai jos.</b><br /><br />
                Menționăm că, în cazul în care vă veți exprima consimțământul pentru primirea de informații/comunicări comerciale în scop de marketing direct, ulterior exprimării acestui consimțământ, <b>aveți dreptul de a vă opune în orice moment ulterior, fără nicio justificare</b>,
                oricăror și tuturor operațiunilor de prelucrare a datelor cu caracter personal pentru unul sau mai multe scopuri, inclusiv în ceea ce privește crearea de profiluri, în măsura în care această activitate este legată de acest scop, respectiv derularea acțiunilor de marketing direct.<br /><br />
                Mai multe detalii cu privire la prelucrarea datelor cu caracter personal și drepturile de care beneficiați găsiți în documentele contractuale.
            </div>
        );

        const insuranceOverlayContent = (
            <div>
                Este necesar acordul pentru prelucrarea datelor cu caracter personal de catre Generali.<br /><br />
                Pentru a beneficia de protecția împotriva riscurilor acoperite de oferta {offer.denumire}, vă informăm că PPC va transmite către Generali, în calitate de împuternicit al Furnizorului PPC, următoarele date cu caracter personal care vă aparțin: nume și prenume, CNP, adresa locului de consum, adresa de e-mail, numărul de telefon, codul Electel.<br /><br />
                Aceste date se transmit în vederea efectuării de către Generali a demersurilor pentru executarea contractului de asigurare, pentru emiterea și transmiterea către dumneavoastră a Certificatului de asigurare sau, după caz, reînnoirea acestuia. În cazul în care nu agreați transmiterea acestor date către Generali, vă aducem la cunoștință că, fără a avea la dispoziție datele dumneavoastră cu caracter personal, necesare executării contractului de asigurare, inclusiv documente ce conțin date cu caracter personal pentru gestionarea cererilor dumneavoastră de acordarea de despăgubiri în baza beneficiului conferit de contract încheiat cu furnizorul PPC, Generali nu va putea să încheie sau, după caz, nu va putea executa condițiile aferente certificatului de asigurare beneficiu aferent ofertei {offer.denumire} și astfel nu veți putea beneficia de protecția acordata prin intermediul acestui produs.
            </div>
        );

        return (
            <div className="MarketingOptions">
                <ModalOverlay
                    show={this.state.showMarketingOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title="Preluare acord GDPR"
                        description={marketingOverlayContent}
                        confirmLabel="Închide"
                        onConfirm={this.handleOverlayDismiss}
                        noDismiss
                        noLogo
                        noFixed
                        show
                        big
                    />
                </ModalOverlay>
                <ModalOverlay
                    show={this.state.showDiscountOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title="Detalii discount"
                        description={(
                            <div>
                                {_.map(this.props.discounts, discount => (
                                    <div key={`discount_description_${discount.DiscountID}`}>
                                        <div>Data de inceput: {discount.DiscountStartDate}</div>
                                        <div>Data de sfarsit: {discount.DiscountEndDate}</div>
                                        {!!discount.Description && <div>Detalii: {discount.Description}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                        confirmLabel="Închide"
                        onConfirm={this.handleOverlayDismiss}
                        noDismiss
                        noLogo
                        noFixed
                        show
                        big
                    />
                </ModalOverlay>
                <ModalOverlay
                    show={this.state.showInsuranceOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title="Preluare acord Generali"
                        description={insuranceOverlayContent}
                        confirmLabel="Închide"
                        onConfirm={this.handleOverlayDismiss}
                        noDismiss
                        noLogo
                        noFixed
                        show
                        big
                    />
                </ModalOverlay>
                <HeaderHero
                    title="Opțiuni de comunicare"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                {this.showVoucherData(this.props.voucher)}
                {this.showVoucherError(this.state.voucherError)}
                <div className="main-content bottom-margin" >
                    <div className="row">
                        <Form className="single-column" ref={(c) => { this.form = c; }}>
                            {this.renderFormErrors('contract')}
                            <fieldset>
                                <div className="order-md-1 col-md-12">
                                    <h4 className="mb-3">Transmitere contract</h4>
                                    <div className="row">
                                        <div className="mb-3 col-md-12">
                                            <div className="custom-control custom-radio ">
                                                <input type="radio" name="radio-group1" className="custom-control-input" id="formCustomRadio118" checked={this.state.email} onChange={() => { }} />
                                                <label className="custom-control-label" htmlFor="formCustomRadio118" onClick={this.handleEmailSelection}>E-mail</label>
                                                <Input
                                                    name="email"
                                                    value={this.state.form.email}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    placeholder="Email"
                                                    containerClass=""
                                                    // validations={[email]}
                                                    disabled={!this.state.email}
                                                    type="email"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-12">
                                            <div className="custom-control custom-radio ">
                                                <input type="radio" name="radio-group1" className="custom-control-input" id="formCustomRadio119" checked={this.state.telefon} onChange={() => { }} />
                                                <label className="custom-control-label" htmlFor="formCustomRadio119" onClick={this.handlePhoneSelection} >Telefon</label>
                                                <Input
                                                    name="telefon"
                                                    value={this.state.form.telefon}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    placeholder="Telefon"
                                                    containerClass=""
                                                    // validations={[tel]}
                                                    disabled={!this.state.telefon}
                                                    type="tel"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            {this.renderInsuranceOptions()}
                            {!_.isEmpty(this.props.campaigns) && <fieldset>
                                <div className="order-md-1 col-md-12">
                                    <h4 className="mb-3">Acord Concurs</h4>
                                    {this.renderCampaigns()}
                                </div>
                            </fieldset>}
                            {!_.isEmpty(this.props.discounts) && <fieldset>
                                <div className="order-md-1 col-md-12">
                                    <h4 className="mb-3">Discount-uri</h4>
                                    {this.renderDiscounts()}
                                </div>
                            </fieldset>}

                            {
                                this.renderVoucher(this.props.voucher, 1)
                            }

                            {/* {
                                // enel tel
                            } */}

                            <fieldset>
                                <div className="order-md-1 col-md-12">
                                    <h4 className="mb-3">Comunicare în scopuri de marketing</h4>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <span className="marketing-disclaimer">Mai multe detalii despre prelucrarea datelor cu caracter personal în scop de marketing găsiți <a className="description-link" href="#" onClick={this.showMarketingOverlay}>aici</a>.</span>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-4 checkbox-acord">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="acord_mk_agree"
                                                    name="acord_mk_agree"
                                                    checked={this.state.form.acord_mk === undefined ? false : this.state.form.acord_mk}
                                                    onChange={this.handleMarketingAgreeCheckBox}
                                                />
                                                <label className="custom-control-label" htmlFor="acord_mk_agree">SUNT DE ACORD</label>
                                            </div>
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="acord_mk_disagree"
                                                    name="acord_mk_disagree"
                                                    checked={this.state.form.acord_mk === undefined ? false : !this.state.form.acord_mk}
                                                    onChange={this.handleMarketingDisagreeCheckBox}
                                                />
                                                <label className="custom-control-label" htmlFor="acord_mk_disagree">NU SUNT DE ACORD</label>
                                            </div>
                                        </div>
                                        <div className="mb-3 col-md-8 checkbox-acord">
                                            <p>
                                                să primesc de la PPC comunicări comerciale în scop de marketing direct care au legatură cu furnizarea de energie electrică şi/sau gaze naturale şi/sau alte bunuri și servicii dezvoltate de către PPC și/sau în colaborare cu parteneri ce pot include dar nu se limitează la produse și/sau servicii privind eficiența energetică, servicii de asistență și reparații instalații de utilități (electricitate, apă, gaz), precum și alte bunuri sau servicii complementare cu serviciile PPC.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-4 checkbox-acord">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    id="acord_part_agree"
                                                    className="custom-control-input"
                                                    checked={this.state.form.acord_part === undefined ? false : this.state.form.acord_part}
                                                    onClick={this.handleMarketingContactDataAgreeCheckBox}
                                                />
                                                <label className="custom-control-label" htmlFor="acord_part_agree">SUNT DE ACORD</label>
                                            </div>
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="acord_part_disagree"
                                                    name="acord_part_disagree"
                                                    checked={this.state.form.acord_part === undefined ? false : !this.state.form.acord_part}
                                                    onClick={this.handleMarketingContactDataDisagreeCheckBox}
                                                />
                                                <label className="custom-control-label" htmlFor="acord_part_disagree">NU SUNT DE ACORD</label>
                                            </div>
                                        </div>
                                        <div className="mb-3 col-md-8 checkbox-acord">
                                            <p>
                                                ca datele mele de contact (nume prenume, email, telefon, adresă) să fie transmise către alte societăți din grupul PPC (PPC Advanced Energy Services Romania) pentru a fi prelucrate în scop de marketing direct ce vizează produse electrice/electrocasnice, servicii de asistență și reparații instalații de utilități (electricitate, apă, gaz), precum și alte bunuri sau servicii complementare cu serviciile PPC.
                                                Mai multe detalii privind prelucrarea datelor cu caracter personal regăsiți accesând www.ppcenergy.ro
                                            </p>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="mb-3 col-md-4 checkbox-acord">
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="acord_profile_agree"
                                                    name="acord_profile_agree"
                                                    checked={this.state.form.acord_profil === undefined ? false : this.state.form.acord_profil}
                                                    onChange={this.handleMarketingProfileaAgreeCheckBox}
                                                />
                                                <label className="custom-control-label" htmlFor="acord_profile_agree">SUNT DE ACORD </label>
                                            </div>
                                            <div className="custom-control custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-control-input"
                                                    id="acord_profil_disagree"
                                                    name="acord_profil_disagree"
                                                    checked={this.state.form.acord_profil === undefined ? false : !this.state.form.acord_profil}
                                                    onChange={this.handleMarketingProfileDisagreeCheckBox}
                                                />
                                                <label className="custom-control-label" htmlFor="acord_profil_disagree">NU SUNT DE ACORD </label>
                                            </div>
                                        </div>
                                        <div className="mb-3 col-md-8 checkbox-acord" >
                                            <p>
                                                să primesc de la PPC comunicări comerciale (marketing direct) personalizate în baza obiceiurilor de consum sau a preferințelor în utilizarea aplicațiilor puse la dispoziție de către PPC în urma creării de profiluri prin mijloace automate sau manuale.
                                            </p>
                                        </div>
                                    </div>
                                    {this.renderMarketingOptions()}
                                </div>
                            </fieldset>
                            <div className="text-center offset-top-lg spaced-bottom-md">
                                <Button type="submit" className="btn btn-primary col-12" onClick={this.handleNextClick} loading={this.state.isContinueCommunicationLoading}>
                                    Continuă
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

MarketingOptions.propTypes = propTypes;
MarketingOptions.defaultProps = defaultProps;

const mapStateToProps = state => ({
    invoice: ocrSelectors.getInvoice(state),
    counties: countiesSelectors.getItems(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    streets: getStreets(state),
    distributors: getDistributors(state),
    isCompleted: isCompleted(state, getFlow(state).toLowerCase()),
    flow: getFlow(state).toLowerCase(),
    session: getSession(state),
    campaigns: getCampaigns(state),
    discounts: getDiscounts(state),
    voucher: getVoucher(state)
});

const mapDispatchToProps = {
    fetchDistributors,
    fetchCities,
    fetchStreets,
    createOffer,
    patchSession,
    setError,
    clearError,
    showLoading,
    hideLoading,
    fetchCampaigns,
    clearCampaigns,
    fetchDiscounts,
    clearDiscounts,
    markAction,
    checkSigned,
    validateVoucher,
    validateCodeEnel,
};

export default connect(mapStateToProps, mapDispatchToProps)(MarketingOptions);
