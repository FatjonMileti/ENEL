import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Loader from 'components/Loader';
import { required, email } from 'components/validation/rules';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import ModalOverlay from 'components/overlays/ModalOverlay';

import * as offersActions from 'store/offers/actions';
import * as sessionActions from 'store/session/actions';
import { setError, sendSessionLink, clearError } from 'store/client/actions';


import * as countiesSelectors from 'store/counties/selectors';
import { getParams, hasParams } from 'store/offers/selectors';
import { clearCache as clearSessionCache } from 'store/session/actions';
import { clearCache as clearVoucherCache } from 'store/voucher/actions';

import pageService from 'services/page';

import * as selectOptions from 'utils/constants/energyInfo';
import { toEnergyTypeData, toEnergyInfoSelect } from 'utils/serializers';

import PlanOptionsForm from './PlanOptionsForm';
import PlanOptionsBusinessForm from './PlanOptionsBusinessForm';
import './PlanOptions.scss';

const propTypes = {
    counties: PropTypes.array,
    setSessionOptions: PropTypes.func.isRequired,
    fetchOffers: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    sendSessionLink: PropTypes.func.isRequired,
};

const defaultProps = {
    counties: {},
};

const initialFormState = {
    judet: '',
    furn24: '0',
    denumire: '',
    energyType: '',
    // energyClientType: 'NONCASNIC',
    consum_anual_estimat: '',
    clientType: 'CONTRACT_FIRMA',
};

class PlanOptions extends Component {
    state = {
        form: { ...initialFormState },
        loaded: false,
        loading: false,
        showEmailOverlay: false,
        email: '',
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        clearSessionCache();
        clearVoucherCache();
        const { hasOfferParams, offerParams } = this.props;
        document.body.className = 'bg-black';

        if (this.props.location.pathname.startsWith('/oferta')) {
            const ct = this.props.location.query['client'] ? this.props.location.query['client'].toUpperCase() : '';

            const initForm = {
                judet: this.props.location.query.judet ? this.props.location.query.judet.toUpperCase() : '',
                furn24: this.props.location.query.furnizare === '24' ? '1' : '0',
                energyType: this.props.location.query.tip ? (this.props.location.query.tip.toUpperCase() === 'EE' ? 'ELECTRICA' : 'GAZE NATURALE') : '',
                denumire: this.props.location.query.denumire,
                // energyClientType: 'NONCASNIC',
                consum_anual_estimat: this.props.location.query.consum_anual ? this.props.location.query.consum_anual : ((ct === 'RES' && this.props.location.query.tip.toUpperCase() === 'EE') ? '1700' : ''),
                clientType: this.props.location.query['client'] ? (ct === 'RES' ? 'CONTRACT PERSOANA FIZICA' : 'CONTRACT FIRMA') : '',
            };

            this.setState({
                form: {
                    ...initForm,
                },
            });
            this.setState({ loaded: true });
        } else if (this.props.location) {
            if (hasOfferParams) {
                const { furnizare } = offerParams;
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({
                    form: {
                        ...initialFormState,
                        furn24: (furnizare == 24) ? '1' : '0',
                    },
                });

                setTimeout(() => {
                    this.setState({ loaded: true });
                }, 1000);
            } else {
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({ loaded: true });
            }
        }
        setTimeout(() => {
            this.setState({ loaded: true });
        }, 300);

    }

    componentWillUnmount() {
        document.body.className = '';
    }

    resetState() {
        this.setState({
            form: { initialFormState },
        });
    }

    async handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleRadioChange(e, name, value) {
        e.preventDefault();
        this.handleInputChange({
            target: { name, value },
        });
    }

    noErrors() {
        return !(this.form.getChildContext()._errors.length > 0);
    }

    noEmailErrors() {
        return !(this.emailForm.getChildContext()._errors.length > 0);
    }

    handleEmailChange(e) {
        this.setState({
            email: e.currentTarget.value,
        });
    }

    async handleNextClick(e) {
        e.preventDefault();
        this.form.validateAll();
        this.props.clearError();
        if (this.noErrors()) {
            const { form } = this.state;
            if (form.consum_anual_estimat === 'BIG') {
                window.location = 'https://www.ppcenergy.ro/business';
            } else {
                try {
                    this.setState({ loading: true });

                    await this.props.setSessionOptions({
                        ...form,
                        isBusiness: form.clientType === 'CONTRACT_FIRMA',
                        type: toEnergyTypeData(form.energyType),
                    });

                    if ((form.energyType === 'ELECTRICA' && Number(form.consum_anual_estimat) > 1000000)
                        || (form.energyType === 'GAZE_NATURALE' && Number(form.consum_anual_estimat) > 2800000)) {
                        this.setState({ loading: false });
                        window.location = 'https://www.ppcenergy.ro/business';
                        // return this.props.setError('Nu se poate contracta accest segment de vanzare pe acest canal.');
                    } else {
                        const options = {
                            judet: form.judet,
                            furn24: form.furn24,
                            consum_anual_estimat: form.consum_anual_estimat,
                        };

                        if (form.clientType === 'CONTRACT_FIRMA') {
                            options.segment = 'BUSINESS';
                        }

                        if (form.energyType) {
                            await this.props.fetchOffers(options, toEnergyTypeData(form.energyType));
                        } else {
                            await this.props.fetchOffers(options, 'EE');
                            await this.props.fetchOffers(options, 'GAZ');
                            await this.props.fetchOffers(options, 'COMBO');
                        }

                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                            'event': 'online_contract',
                            'step': 1,
                            'location': form.judet, // location selected (judet)
                            'client_type': form.clientType === "CONTRACT_PERSOANA_FIZICA" ? "residential" : "business", // residential or business client
                            'service_type': form.energyType, // energy or gas
                            'estimated_consumption': form.consum_anual_estimat, // annual estimated consumption volume selected
                        });

                        // browserHistory.push(pageService.links['plans']);
                        browserHistory.push({
                            pathname: pageService.links['plans'],
                            state: {
                                consum_anual: form.consum_anual_estimat,
                                denumire: this.state.form.denumire,
                                tip: this.props.location.query.tip ? (this.props.location.query.tip.toLowerCase()) : undefined,
                            },
                        });
                    }
                } catch (e) {
                    console.log(e);
                    this.props.setError('Ofertele nu au putut fi listate.');
                    this.setState({ loading: false });
                }

            }
        }
    }

    async handleRestoreProcess(e) {
        e.preventDefault();
        this.setState({
            showEmailOverlay: true,
        });
    }

    handleEmailConfirm(e) {
        e.preventDefault();
        this.emailForm.validateAll();

        if (this.noEmailErrors()) {
            this.setState({
                showEmailOverlay: false,
            });
            this.props.sendSessionLink(this.state.email);
        }
    }

    handleOverlayDismiss(e) {
        e.preventDefault();
        this.setState({
            showEmailOverlay: false,
        });
    }

    getEnergyEstimate() {
        const { energyType } = this.state.form;
        return energyType ? toEnergyInfoSelect(selectOptions.ENERGY_ANNUAL_ESTIMATION[energyType]) : [];
    }

    setForm(form) {
        this.form = form;
    }

    render() {
        const { hasOfferParams } = this.props;
        const { loaded } = this.state;
        const counties = _.map(this.props.counties, v => ({ value: v.denumire, label: v.denumire }));
        return (
            <div className="PlanOptions">
                {loaded && <ModalOverlay
                    show={this.state.showEmailOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title={<span>Introduceți{pageService.isMobile() ? <br /> : null} adresa de e-mail</span>}
                        confirmLabel="Trimite"
                        onConfirm={this.handleEmailConfirm}
                        noDismiss
                        noLogo
                        noFixed
                        show
                        big
                    >
                        <Form
                            lightTheme
                            ref={(c) => {
                                this.emailForm = c;
                            }}
                        >
                            <Input
                                name="email"
                                value={this.state.email}
                                className="form-control"
                                containerClass="mb-3 col-md-4 offset-md-4 email-input"
                                placeholder="E-mail"
                                onChange={this.handleEmailChange}
                                validations={[required, email]}
                            />
                        </Form>
                    </ConfirmOverlay>
                </ModalOverlay>}

                <header className="container top-header header--small header--transparent">
                    <div className="row logo-bar">
                        <div className="col-left">
                            <div className="logo-header">
                                <a href="#">
                                    <img src="imgs/PPC_logo_negative.svg" />
                                </a>
                            </div>
                        </div>
                    </div>
                </header>
                <div
                    className={`first-page bottom-margin transition-3s ${this.state.loading ? 'content-leave' : ''}`}
                >
                    <PlanOptionsBusinessForm
                        hasOfferParams={hasOfferParams}
                        setForm={this.setForm}
                        loaded={loaded}
                        counties={counties}
                        form={this.state.form}
                        handleInputChange={this.handleInputChange}
                        getEnergyEstimate={this.getEnergyEstimate}
                        handleNextClick={this.handleNextClick}
                        handleRestoreProcess={this.handleRestoreProcess}
                    />

                    {/* <PlanOptionsForm */}
                    {/*    hasOfferParams={hasOfferParams} */}
                    {/*    setForm={this.setForm} */}
                    {/*    loaded={loaded} */}
                    {/*    counties={counties} */}
                    {/*    form={this.state.form} */}
                    {/*    handleInputChange={this.handleInputChange} */}
                    {/*    handleNextClick={this.handleNextClick} */}
                    {/*    handleRestoreProcess={this.handleRestoreProcess} */}
                    {/* /> */}
                </div>
                <Loader
                    show={this.state.loading}
                />
            </div>
        );
    }
}

PlanOptions.propTypes = propTypes;
PlanOptions.defaultProps = defaultProps;

const mapStateToProps = state => ({
    counties: countiesSelectors.getItems(state),
    offerParams: getParams(state),
    hasOfferParams: hasParams(state),
    // isBusinessOffer: hasParam(state, 'isBusiness'),
});

const mapDispatchToProps = {
    fetchOffers: offersActions.fetchItems,
    setSessionOptions: sessionActions.setOptions,
    setError,
    clearError,
    sendSessionLink,
    clearSessionCache,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlanOptions);
