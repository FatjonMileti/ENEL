import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import * as providersActions from 'store/providers/actions';
import { patch as patchSession } from 'store/session/actions';
import { updateRegistrationInfo } from 'store/registration/actions';

import * as providersSelectors from 'store/providers/selectors';
import { getSession } from 'store/session/selectors';
import { getRegistrationNumber } from 'store/registration/selectors';
import { getItems as getCounties } from 'store/counties/selectors';
import { getCurrentPlan } from 'store/offers/selectors';
import { setOptions as setClientOptions, markAction } from 'store/client/actions';

import offerService from 'services/offer';
import pageService from 'services/page';

import Form from 'components/validation/form';
import Button from 'components/validation/button';
import Select from 'components/validation/select';
import BinaryRadio from 'components/validation/binaryRadio';
import FormErrors from 'components/FormErrors';
import { required } from 'components/validation/rules';
import { showLoading, hideLoading } from '../../store/ui/actions';
import HeaderHero from 'components/heroes/HeaderHero';

import { toRegistrationPostData } from 'utils/serializers';

import './ServiceInfo.scss';

const propTypes = {
    session: PropTypes.object,
    eeProviders: PropTypes.array,
    gazProviders: PropTypes.array,
    counties: PropTypes.array,
    plan: PropTypes.object,
    fetchProviders: PropTypes.func.isRequired,
    patchSession: PropTypes.func.isRequired,
    setClientOptions: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    session: {},
    eeProviders: [],
    gazProviders: [],
    counties: {},
    plan: {},
};

class ServiceInfo extends Component {

    form = {
        ee_are_furnizare_activa: this.props.session.ee_are_furnizare_activa,
        ee_schimba_titular: this.props.session.ee_schimba_titular,
        ee_furnizor_actual: this.props.session.ee_furnizor_actual || '',
        ee_loc: {
            furnizor_id: this.props.session.ee_loc ? this.props.session.ee_loc.furnizor_id : '',
        },

        gaz_are_furnizare_activa: this.props.session.gaz_are_furnizare_activa,
        gaz_schimba_titular: this.props.session.gaz_schimba_titular,
        gaz_furnizor_actual: this.props.session.gaz_furnizor_actual || '',
        gaz_loc: {
            furnizor_id: this.props.session.gaz_loc ? this.props.session.gaz_loc.furnizor_id : '',
        },
    };

    formErrors = {
        provider: [],
    };

    state = {
        form: this.form,
        formErrors: this.formErrors,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchProviders();
        this.props.markAction(pageService.actions.INFORMATII_FURNIZARE.value);
    }

    shouldTypeRender(type) {
        const plan = offerService.getPlanDetails(this.props.plan);

        if (plan && plan.serviciu) {
            const service = plan.serviciu.toUpperCase();

            if (service == 'COMBO' || service == type.toUpperCase()) {
                return true;
            }
        }

        return false;
    }

    handleInputChange(e) {
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

    handleProviderChange(e, type) {
        const data = {};
        data[`${type}_furnizor_actual`] = e.target.value ? e.target.value : '';
        data[`${type}_loc`] = _.extend(this.state.form[`${type}_loc`], {
            furnizor_id: e.target.value ? e.target.value : '',
        });

        this.setState({
            form: _.extend(this.state.form, data),
        });
    }

    handleNoProvider(type) {
        this.setState({
            form: _.extend(this.state.form, {
                [`${type}_are_furnizare_activa`]: false,
                [`${type}_furnizor_actual`]: '',
                [`${type}_loc`]: _.extend(this.state.form[`${type}_loc`], {
                    furnizor_id: '',
                }),
            }),
        });
    }

    noErrors() {
        if (!_.isNil(_.find(this.state.formErrors, section => section.length > 0))) return false;
        return !(this.form.getChildContext()._errors.length > 0);
    }

    async handleNextClick(e) {
        e.preventDefault();
        this.resetFormErrors();
        this.form.validateAll();
        this.validateProvider('ee');
        this.validateProvider('gaz');

        if (this.noErrors()) {

            const furnizareActiva = this.state.form[`${this.props.session.type.toLowerCase()}_are_furnizare_activa`];
            const furnizorActual = this.state.form[`${this.props.session.type.toLowerCase()}_furnizor_actual`];
            const schimbaTitular = this.state.form[`${this.props.session.type.toLowerCase()}_schimba_titular`];

            let furnizorName = "";
            if(furnizorActual) {
                const providers = _.map(this.props[`${this.props.session.type.toLowerCase()}Providers`], v => ({
                    value: v.internal_id,
                    label: v.denumire,
                }));

                const furnizor = providers.find((item) => item.value === furnizorActual);
                if(furnizor){
                    furnizorName = furnizor.label
                }
            }
            const {session} = this.props
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 4,
                'current_service': furnizareActiva ? "yes" : "no",
                'current_provider': furnizorName,
                'change_contract_holder': schimbaTitular ? "yes" : "no",
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });

            this.props.showLoading();
            await this.props.patchSession(this.state.form);
            await this.props.updateRegistrationInfo(
                toRegistrationPostData(this.state.form, this.props),
                this.props.registrationNumber
            );
            await this.props.setClientOptions({
                ee_are_furnizare_activa: this.state.form.ee_are_furnizare_activa,
                gaz_are_furnizare_activa: this.state.form.gaz_are_furnizare_activa,
            });


            pageService.scrollToTop();
            browserHistory.push(pageService.links['client-info-scan']);
        } else {
            pageService.scrollToError();
        }
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
    }

    validateProvider(type) {
        const provider = _.find(this.props[`${type}Providers`], item => item.internal_id == this.state.form[`${type}_furnizor_actual`]);
        const county = _.find(this.props.counties, item => item.denumire == this.props.session.judet);

        let isEnelProvider = false;
        if (provider && provider.denumire) {
            isEnelProvider = provider.denumire.toLowerCase().match('enel');
        }

        let isEnelCounty = false;
        if (county && county.distribution) {
            isEnelCounty = (county.distribution.distributie_enel == 'D');
        }

        /* if (type == 'gaz' && !isEnelCounty && this.state.form[`${type}_are_furnizare_activa`] && isEnelProvider && !this.state.form[`${type}_schimba_titular`]) {
            const { formErrors } = this.state;
            formErrors.provider = ['Procesul nu poate fi continuat. Contract activ la PPC.'];
            this.setState({
                formErrors,
            });
        } */
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

    renderServiceLabel(type) {
        const plan = offerService.getPlanDetails(this.props.plan);

        if (plan && plan.serviciu) {
            const service = plan.serviciu.toUpperCase();

            if (service == 'COMBO') {
                return type == 'ee' ? (
                    <p className="service-label eyebrow georgia">Energie electrică</p>
                ) : (
                    <p className="service-label eyebrow georgia">Gaze naturale</p>
                );
            }
        }
    }

    renderProviders(type) {
        const providers = _.map(this.props[`${type}Providers`], v => ({ value: v.internal_id, label: v.denumire }));

        if (this.shouldTypeRender(type) && this.state.form[`${type}_are_furnizare_activa`]) {
            return (
                <div className="row provider-autocomplete">
                    <Select
                        name="_furnizor_actual"
                        label="Care este furnizorul tău actual?"
                        placeholder="Alege"
                        value={this.state.form[`${type}_furnizor_actual`]}
                        errorLabel="Alege un furnizor."
                        className="form-control"
                        containerClass="mb-3 col-md-12"
                        validations={[required]}
                        autocomplete
                        onSelect={e => this.handleProviderChange(e, type)}
                        items={providers}
                    />
                </div>
            );
        }
    }

    getEnergyLabel(type) {
        return this.props.session.contract_type === 'b2b'
            ? 'Pentru locul de consum racordat la rețea, pentru care a fost solicitată oferta, există în prezent în derulare un contract de furnizare activ?'
            : `Beneficiezi în prezent de ${type == 'gaz' ? 'gaze naturale' : 'energie electrică'} la adresa locului tău consum?`;
    }

    renderOptions(type) {
        if (this.shouldTypeRender(type)) {
            return (
                <div className="order-md-1 col-md-12">
                    {this.renderServiceLabel(type)}
                    <div className="row">
                        <BinaryRadio
                            containerClass="mb-3 col-md-12 col-lg-12"
                            name={`${type}_are_furnizare_activa`}
                            label={this.getEnergyLabel(type)}
                            errorLabel="Câmp obligatoriu."
                            onAgree={e => this.handleRadioChange(e, `${type}_are_furnizare_activa`, true)}
                            onDisagree={() => this.handleNoProvider(type)}
                            value={this.state.form[`${type}_are_furnizare_activa`]}
                            validations={[required]}
                        />
                    </div>
                    {this.renderProviders(type)}
                    <div className="row">
                        <BinaryRadio
                            containerClass="mb-3 col-md-12 col-lg-12"
                            name={`${type}_schimba_titular`}
                            label="Vrei să schimbi titularul contractului de furnizare?"
                            errorLabel="Câmp obligatoriu."
                            tooltip="Ești proprietarul unei locuințe și nu ai trecut încă contractul de furnizare pe numele tău?"
                            onAgree={e => this.handleRadioChange(e, `${type}_schimba_titular`, true)}
                            onDisagree={e => this.handleRadioChange(e, `${type}_schimba_titular`, false)}
                            value={this.state.form[`${type}_schimba_titular`]}
                            validations={[required]}
                        />
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="ServiceInfo">
                <HeaderHero
                    title="Contractul tău de furnizare"
                    showRegistrationInfo
                />
                <div className="main-content bottom-margin autocomplete-padding" >
                    {this.renderFormErrors('provider')}
                    <div className="row">
                        <Form className="needs-validation spaced" noValidate ref={(c) => { this.form = c; }}>
                            {this.renderOptions('ee')}
                            {this.renderOptions('gaz')}

                            <div className="text-center offset-top">
                                <Button type="submit" className="btn btn-primary col-12" onClick={this.handleNextClick}>
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

ServiceInfo.propTypes = propTypes;
ServiceInfo.defaultProps = defaultProps;

const mapStateToProps = state => ({
    eeProviders: providersSelectors.getItems(state, 'ee'),
    gazProviders: providersSelectors.getItems(state, 'gaz'),
    counties: getCounties(state),
    session: getSession(state),
    plan: getCurrentPlan(state),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    fetchProviders: providersActions.fetchItems,
    patchSession,
    showLoading,
    hideLoading,
    setClientOptions,
    markAction,
    updateRegistrationInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceInfo);
