import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import _ from 'lodash';

import * as ocrSelectors from 'store/ocr/selectors';
import { getSession } from 'store/session/selectors';
import { getItems as getDistributors } from 'store/distributors/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getItems as getInvoiceExamples } from 'store/invoiceExamples/selectors';
import { getFlow, getNLC, getNLCValidation } from 'store/client/selectors';
import { getRegistrationNumber } from 'store/registration/selectors';
import { markAction } from 'store/client/actions';
import * as ocrActions from 'store/ocr/actions';
import { patch as patchSession } from 'store/session/actions';
import { fetchAllItems as fetchDistributors } from 'store/distributors/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { fetchAllItems as fetchInvoiceExamples } from 'store/invoiceExamples/actions';
import { hideClientPlaceDocs, hideLoading, showClientPlaceDocs, showLoading } from 'store/ui/actions';
import { updateRegistrationInfo } from 'store/registration/actions';

import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Select from 'components/validation/select';
import Button from 'components/validation/button';
import ImagesOverlay from 'components/overlays/ImagesOverlay';
import Tooltip from 'components/Tooltip';
import HeaderHero from 'components/heroes/HeaderHero';
import FormErrors from 'components/FormErrors';
import { required, codPostal, laterThanToday, max10, serieBuletin, tel, integer, containsDigit, maxLength } from 'components/validation/rules';
import {isLessOrEqual45Days, isGreaterThan45Days} from "utils/index"
import pageService from 'services/page';
import ocrService from 'services/ocr';
import { toRegistrationPostData } from 'utils/serializers';

import './ClientPlaceInfo.scss';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import { getStepIdByPathname } from 'utils/helpers';
import { ABANDON_LINK, ABANDON_TYPES } from 'utils/constants/app';

const propTypes = {
    invoice: PropTypes.object,
    distributors: PropTypes.array,
    counties: PropTypes.array,
    cities: PropTypes.array,
    streets: PropTypes.array,
    streetTypes: PropTypes.object,
    session: PropTypes.object,
    flow: PropTypes.string,
    nlc: PropTypes.object,
    patchSession: PropTypes.func.isRequired,
    fetchDistributors: PropTypes.func.isRequired,
    fetchCities: PropTypes.func.isRequired,
    fetchStreets: PropTypes.func.isRequired,
    hideClientPlaceDocs: PropTypes.func.isRequired,
    showClientPlaceDocs: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    invoice: {
        address: {},
    },
    session: {
        _loc: {},
    },
    flow: '',
    nlc: {},
    distributors: [],
    counties: [],
    cities: [],
    streets: [],
    streetTypes: {},
};

const PRODUCT_FLOW = {
    CHANGE_FLOW: "P_CH_FLOW",
    TRANSFER_FLOW: "TR_FLOW",
    SWITCH_FLOW: "SWITCH_FLOW",
    ACTIVATION_FLOW: "ACT_FLOW"
}

class ClientPlaceInfo extends Component {

    form = {
        cod_pod: this.getFromSession('cod_pod'),
        eneltel: this.props.nlc.eneltelCode ? this.props.nlc.eneltelCode : '',
        necesar_pif: false,
        nlc: this.getFromSession('nlc'),
        categorie: '',
        nivel_tensiune: 'JT',
        distribuitor_id: '',
        denumire: 'LOCUINTA',
        judet: this.getCountyFromSession(),
        localitate: this.getFromSession('localitate'),
        tip_artera: this.getFromSession('tip_artera') || 'STRADA',
        strada: this.getFromSession('strada'),
        nr_strada: this.getStreetNumberWithFNFlag(),
        bloc: this.getFromSession('bloc') || this.getFromInvoiceAddress('building'),
        scara: this.getFromSession('scara') || this.getFromInvoiceAddress('entrance'),
        apartament: this.getFromSession('apartament') || this.getFromInvoiceAddress('flat'),
        etaj: this.getFromSession('etaj') || this.getFromInvoiceAddress('floor'),
        cod_postal: this.getFromSession('cod_postal') || this.getFromInvoiceAddress('postalCode'),
        sold: '',
        // index: this.getFromSession('index'),
        nr_contract_actual: this.getFromSession('nr_contract_actual'),
    };

    formErrors = {
        judet: [],
    };

    state = {
        form: this.form,
        formErrors: this.formErrors,
        nlcInput: {
            show: false,
            readOnly: false,
        },
        invoiceAddressLoaded: {
            county: false,
            city: false,
            streetType: false,
            street: false,
        },
        showOverlay: false,
        showNlcWarningMessage: false
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchDistributors();
        this.props.fetchInvoiceExamples();

        if (!this.state.nlc) {
            this.loadNLCCode();
        }

        if (this.shouldLoadInvoice(this.props)) {
            this.loadInvoiceAddress(this.props);
        } else {
            this.props.fetchCities(this.state.form.judet);
            this.props.fetchStreets(this.state.form.judet, this.state.form.localitate);
        }

        this.props.markAction(pageService.actions.IDENTIFICARE_LOC_CONSUM.value);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.nlc && nextProps.flow && nextProps.distributors && nextProps.session && nextProps.session.judet && !this.state.form.distribuitor_id) {
            this.setValues(nextProps);
        }
        if (this.shouldLoadInvoice(nextProps)) {
            this.loadInvoiceAddress(nextProps);
        }
    }

    shouldLoadInvoice(props) {
        if (this.getFromSession('judet')) {
            return false;
        }
        return props.invoice && this.props.invoice.address && this.props.invoice.address.county && _.size(props.counties);
    }

    getCountyFromSession() {
        if (this.getFromSession('judet') != '') {
            return this.getFromSession('judet');
        } else if (!_.isNil(this.props.session.judet)) {
            return this.props.session.judet;
        }
        return '';
    }

    getStreetNumberWithFNFlag() {
        const streetNo = this.getFromSession('nr_strada') || this.getFromInvoiceAddress('streetNo');
        return ((this.props.nlc.status !== 'NOK') && ((!streetNo || (streetNo.length === 0)) || (streetNo.toLowerCase() === 'fn'))) ? 'FN1' : streetNo;
    }

    getFromSession(property) {
        if (this.props.session[`${this.props.flow}_loc`]) {
            return this.props.session[`${this.props.flow}_loc`][property] || '';
        }

        return '';
    }

    getFromInvoiceAddress(property) {
        if (this.props.invoice.address && !this.isAddressDisabled()) {
            return this.props.invoice.address[property] || '';
        }

        return '';
    }

    getFilteredCities() {
        if (this.state.form.judet) {
            return _.filter(this.props.cities, city => city.judet == this.state.form.judet);
        }
    }

    getFilteredStreets() {
        if (this.state.form.localitate) {
            const city = _.find(this.props.cities, city => city.internal_id == this.state.form.localitate);

            if (city) {
                return _.filter(this.props.streets, street => street.localitate == city.denumire);
            }
        }
    }

    getNLCType() {
        if (!_.isNil(this.props.session.client)) {
            const county = _.find(this.props.counties, item => item.denumire === this.props.session.judet);

            if (this.props.flow == 'gaz') {
                return 'CLC';
            }

            if (county && county.distribution.distributie_enel == 'D') {
                return 'POD';
            }
        }

        return 'NLC';
    }

    loadNLCCode() {
        const type = this.getNLCType();

        if (type == 'NLC') {
            const nlcCode = this.props.nlc ? this.props.nlc.cod_pod : '';
            const invoiceNLC = this.props.invoice.nlc;

            if (nlcCode) {
                this.handleInputChange({ target: { name: 'nlc', value: nlcCode } });
                this.setState({
                    nlcInput: { show: true, readOnly: true },
                });
            } else if (invoiceNLC) {
                this.handleInputChange({ target: { name: 'nlc', value: invoiceNLC } });
                this.setState({
                    nlcInput: { show: true, readOnly: false },
                });
            } else {
                this.setState({
                    nlcInput: { show: true, readOnly: false },
                });
            }
        } else {
            this.handleInputChange({ target: { name: 'nlc', value: this.state.form.cod_pod } });
        }
    }

    async loadInvoiceAddress(nextProps) {
        if (nextProps.invoice.address) {
            const invoiceAddress = nextProps.invoice.address;
            const county = ocrService.matchAddress(nextProps.counties, invoiceAddress.county, 'denumire');
            // eslint-disable-next-line one-var
            let city,
                streetType,
                street;

            if (nextProps.streetTypes && invoiceAddress.streetType) {
                streetType = ocrService.matchAddress(nextProps.streetTypes, invoiceAddress.streetType, 'cod');
                if (streetType && !this.state.invoiceAddressLoaded.streetType) {
                    this.handleInputChange({ target: { name: 'tip_artera', value: streetType.cod } });
                    this.setInvoiceAddressLoaded('streetType');
                }
            }

            if (county) {
                if (!this.state.invoiceAddressLoaded.county) {
                    await this.handleCountyChange({ target: { value: county.denumire } });
                    this.setInvoiceAddressLoaded('county');
                }
                if (_.size(nextProps.cities)) {
                    city = ocrService.matchAddress(nextProps.cities, invoiceAddress.city, 'denumire');
                }
            }

            if (city) {
                if (!this.state.invoiceAddressLoaded.city) {
                    await this.handleCityChange({ target: { value: city.internal_id } });
                    this.setInvoiceAddressLoaded('city');
                }
                if (_.size(nextProps.streets)) {
                    street = ocrService.matchAddress(nextProps.streets, invoiceAddress.streetName, 'denumire');
                }
            }

            if (street && !this.state.invoiceAddressLoaded.street) {
                this.handleInputChange({ target: { name: 'strada', value: street.internal_id } });
                this.setInvoiceAddressLoaded('street');
            }
        }
    }

    setInvoiceAddressLoaded(prop) {
        this.setState({
            invoiceAddressLoaded: _.extend(this.state.invoiceAddressLoaded, {
                [prop]: true,
            }),
        });
    }

    setValues(nextProps) {
        if (nextProps.session[`${nextProps.flow}_loc`]) {
            this.setState({
                form: _.extend(this.state.form, {
                    cod_pod: nextProps.session[`${nextProps.flow}_loc`].cod_pod || '',
                }),
            });

            if (nextProps.session[`${nextProps.flow}_loc`].distribuitor_id) {
                this.setState({
                    form: _.extend(this.state.form, {
                        distribuitor_id: nextProps.session[`${nextProps.flow}_loc`].distribuitor_id,
                    }),
                });
            }
        }

        let distributor = null;
        let nlcValidationDistributor = null;
        if (nextProps.nlc && nextProps.nlcValidation && nextProps.nlcValidation.distributor && nextProps.nlcValidation.distributor.internal_id) {
            nlcValidationDistributor = nextProps.nlcValidation.distributor.internal_id;
        }

        if (this.props.flow == 'ee') {
            if (nextProps.nlc && nextProps.nlc.distributorId) {
                distributor = _.find(nextProps.distributors, item => item.internal_id == nextProps.nlc.distributorId);
            } else if (nlcValidationDistributor) {
                distributor = _.find(nextProps.distributors, item => item.internal_id == nlcValidationDistributor);
            } else {
                const county = _.find(nextProps.counties, item => item.denumire === nextProps.session.judet);
                distributor = _.find(nextProps.distributors, item => item.internal_id == county.distribution.id_enel);
            }
        } else {
            distributor = _.find(nextProps.distributors, item => item.internal_id == nlcValidationDistributor);
        }

        if (distributor) {
            this.setState({
                form: _.extend(this.state.form, {
                    distribuitor_id: distributor.internal_id,
                }),
            });
        }
    }

    isAddressDisabled() {
        return !!this.props.nlc.districtId;
    }

    isActualContractNumberRequired() {
        return (this.props.session[`${this.props.flow}_schimba_furnizor`] === true && this.props.session[`${this.props.flow}_schimba_titular`] === false);
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleCountyChange(e) {
        return new Promise((resolve) => {
            this.setState({
                form: _.extend(this.state.form, {
                    judet: e.target.value,
                    localitate: '',
                    strada: '',
                }),
            }, async () => {
                await this.props.fetchCities(e.target.value);
                resolve();
            });
        });
    }

    handleCityChange(e) {
        return new Promise((resolve) => {
            this.setState({
                form: _.extend(this.state.form, {
                    localitate: e.target.value,
                    strada: '',
                }),
            }, async () => {
                await this.props.fetchStreets(this.state.form.tip_artera, e.target.value);
                resolve();
            });
        });
    }

    getInvoiceExamples() {
        return _.map(this.props.nlcInvoiceExamples, item => item.url);
    }

    noErrors() {
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

    validateCustomRules() {
        const { formErrors } = this.state;

        if (this.props.session.judet !== this.state.form.judet) {
            formErrors.judet.push('Județul locului de consum diferă de cel ales la selecția ofertei.');
        }

        this.setState({
            formErrors,
        });
    }

    handleInvoiceExamplesClick() {
        this.setState({ showOverlay: true });
    }

    handleOverlayHide() {
        this.setState({ showOverlay: false });
    }

    getFlow(session) {

        const supply = session[`${this.props.flow}_are_furnizare_activa`];
        const swTitular = session[`${this.props.flow}_schimba_titular`];

        const currentSupplier = session[`${this.props.flow}_furnizor_actual`]
        const PPCInternalIds = ['T_RO22000460'];
        const swSupplier = !PPCInternalIds.includes(currentSupplier);

        if (supply && !swSupplier && !swTitular) {
            return PRODUCT_FLOW.CHANGE_FLOW
        }

        // Transfer flow (supply = true, sw_supplier = false, sw_titular = true)
        if (supply && !swSupplier && swTitular) {
            return PRODUCT_FLOW.TRANSFER_FLOW
        }

        // Switch_In flow (supply = true, sw_supplier = true, sw_titular = false)
        if (supply && swSupplier && !swTitular) {
            return PRODUCT_FLOW.SWITCH_FLOW
        }

        // Activation flow (supply = false, sw_supplier = false, sw_titular = false)
        if (!supply && !swTitular) {
            return PRODUCT_FLOW.ACTIVATION_FLOW
        }

        return "";
    }


    handleProductChangeValidations() {
        const productFlow = this.getFlow(this.props.session);
        const {nlc} = this.props;

        const errors =  { isRequired: false, isBlockingStep: false }


        if (productFlow === PRODUCT_FLOW.CHANGE_FLOW && nlc.piata !== "PL") {
            if (nlc.valabilitate && !nlc.data_atr) {
                errors.isRequired = true
            }

            if (nlc.data_atr) {
                const isLesOrEq45Ds = isLessOrEqual45Days(nlc.data_atr);
                if (isLesOrEq45Ds) {
                    errors.isBlockingStep = true
                }
            }

            if(!nlc.valabilitate && nlc.data_atr && isGreaterThan45Days(nlc.data_atr)){
                errors.isRequired = false;
                errors.isBlockingStep = false
            }

            if (
                nlc.valabilitate &&
                nlc.data_atr &&
                isGreaterThan45Days(nlc.data_atr)
            ) {
                errors.isRequired = true
            }
        }

        if (productFlow === PRODUCT_FLOW.TRANSFER_FLOW) {
            if (nlc.data_atr && isLessOrEqual45Days(nlc.data_atr)) {
                errors.isBlockingStep = true
            }
        }

        if (productFlow === PRODUCT_FLOW.SWITCH_FLOW || productFlow === PRODUCT_FLOW.ACTIVATION_FLOW) {
            if (nlc.data_atr && isLessOrEqual45Days(nlc.data_atr)) {
                errors.isBlockingStep = false;
                errors.isRequired = false;
            }
        }
        return { ...errors, productFlow };
    }

    async handleNextClick(e) {
        e.preventDefault();
        this.resetFormErrors();
        this.form.validateAll();
        this.validateCustomRules();
        const { nlc } = this.props;

        const response = this.handleProductChangeValidations()

        if(response.isBlockingStep){
            this.setState({showNlcWarningMessage: true})
        }

        if (this.noErrors() && !response.isBlockingStep) {
            const { form } = this.state;

            await this.props.patchSession({ _loc: { nlcInfo: nlc, ...form } });

            const numeStrada = this.getFilteredStreets().filter(s => s.internal_id === form.strada)[0].denumire;
            await this.props.updateRegistrationInfo(
                toRegistrationPostData({
                    ...form, nume_strada: numeStrada,
                }, this.props),
                this.props.registrationNumber
            );

            const changeOwner = this.props.session[`${this.props.flow}_schimba_titular`];

            pageService.scrollToTop();

            if(response.isRequired && [PRODUCT_FLOW.CHANGE_FLOW, PRODUCT_FLOW.TRANSFER_FLOW].includes(response.productFlow)){
                this.props.showClientPlaceDocs();
                return browserHistory.push(pageService.links['client-place-docs']);
            }

            const {session} = this.props
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 10,
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });

            if (!changeOwner && nlc.cnp_cui && nlc.status !== 'INACTIV') {
                this.props.hideClientPlaceDocs();
                browserHistory.push(pageService.links['contract-options']);
            } else {
                this.props.showClientPlaceDocs();
                browserHistory.push(pageService.links['client-place-docs']);
            }
        } else {
            pageService.scrollToError();
        }
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

    renderDistributor() {
        if (this.props.flow == 'gaz' && this.props.distributors) {
            const distributors = _.filter(this.props.distributors, distributor => distributor.gaz);
            const items = _.map(distributors, v => ({ value: v.internal_id, label: v.denumire }));

            return (
                <Select
                    name="distribuitor_id"
                    label="Distribuitor"
                    placeholder="Alege"
                    value={this.state.form.distribuitor_id}
                    className="form-control"
                    containerClass={`mb-3 ${this.state.nlcInput.show ? 'col-md-6' : 'col-md-12'}`}
                    validations={[required]}
                    autocomplete
                    onSelect={this.handleInputChange}
                    items={items}
                    upperCase
                />
            );
        }

        if (this.props.flow == 'ee' && this.props.session[`${this.props.flow}_loc`].cod_pod.startsWith('59402') && this && this.props.distributors) {
            const distributors = _.filter(this.props.distributors, distributor => distributor.ee && (distributor.internal_id === 'D_18886369' || distributor.internal_id === 'D_14476722'));
            const items = _.map(distributors, v => ({ value: v.internal_id, label: v.denumire }));

            return (
                <Select
                    name="distribuitor_id"
                    label="Distribuitor"
                    placeholder="Alege"
                    value={this.state.form.distribuitor_id}
                    className="form-control"
                    containerClass={`mb-3 ${this.state.nlcInput.show ? 'col-md-6' : 'col-md-12'}`}
                    validations={[required]}
                    // autocomplete
                    onSelect={this.handleInputChange}
                    items={items}
                    upperCase
                />
            );
        }

        const distributor = _.find(this.props.distributors, item => item.internal_id == this.state.form.distribuitor_id);

        return (
            <div className={`mb-3 ${this.state.nlcInput.show ? 'col-md-6' : 'col-md-12'}`}>
                <label>Distribuitor</label>
                <input className="form-control" name="distribuitor_id" value={distributor ? distributor.denumire : ''} disabled />
            </div>
        );
    }

    async handleNlcWarningDismiss(e){
        this.setState({showNlcWarningMessage: false})
        await this.abortProcess(e)
    }


    async abortProcess(e) {
        e.preventDefault();
        await this.props.showLoading();

        const {session} = this.props

        try {

            await this.props.updateRegistrationInfo(
                toRegistrationPostData({
                    abortProcess: true,
                    stepId: getStepIdByPathname(window.location.pathname.replace('/', '')),
                }, { session, location: this.props.location }),
                this.props.registrationNumber
            );
            await this.props.patchSession({ abandon_type: ABANDON_TYPES.ABORT })
            window.location = ABANDON_LINK;
            setTimeout(async () => {
                await hideLoading();
            }, 2000);


        } catch (error) {
            await hideLoading();
            console.error(error);
        }

    };

    render() {
        const counties = _.map(this.props.counties, v => ({ value: v.denumire, label: v.denumire }));
        const cities = _.map(this.getFilteredCities(), v => ({ value: v.internal_id, label: v.denumire }));
        const streetTypes = _.map(this.props.streetTypes, v => ({ value: v.cod, label: v.cod }));
        const streets = _.map(this.getFilteredStreets(), v => ({ value: v.internal_id, label: v.denumire }));

        return (
            <div className="ClientPlaceInfo">
                <HeaderHero
                    title="Detalii loc de consum"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <ImagesOverlay
                    show={this.state.showOverlay}
                    title="Cum găsesc Cod Loc Consum pe factura de utilități?"
                    images={this.getInvoiceExamples()}
                    onHide={this.handleOverlayHide}
                />
                <ConfirmOverlay
                    title='Atentie!'
                    description="Ne pare rău, însă avizul tehnic de racordare al locului de consum este expirat. Te rugăm să iei legatura cu un consultant PPC, pentru a putea continua procesul de contractare"
                    confirmLabel="Inchide"
                    show={this.state.showNlcWarningMessage}
                    onConfirm={this.handleNlcWarningDismiss}
                    onlyOkButton
                />
                <div className="main-content bottom-margin" >
                    {this.renderFormErrors('judet')}
                    <div className="row">
                        <Form className="needs-validation was-validated" ref={(c) => { this.form = c; }}>
                            <fieldset>
                                <div className="order-md-1 col-md-12">
                                    <h4 className="mb-3">Date generale</h4>
                                    <div className="row client-autocomplete">
                                        {this.renderDistributor()}
                                        {this.state.nlcInput.show &&
                                            <Input
                                                name="nlc"
                                                label="Cod Loc Consum [NLC]"
                                                value={this.state.form.nlc}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                containerClass="mb-3 col-md-6"
                                                validations={[required]}
                                                disabled={this.state.nlcInput.readOnly}
                                                upperCase
                                            />
                                        }
                                        {this.state.nlcInput.show && !_.isEmpty(this.props.nlcInvoiceExamples) &&
                                            <Tooltip
                                                info="Cum găsesc Cod Loc Consum pe factura de utilități?"
                                                onClick={this.handleInvoiceExamplesClick}
                                            />
                                        }
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div className="order-md-1 col-md-12">
                                    <h4 className="mb-3">Adresă loc de consum</h4>
                                    <div className="row client-autocomplete">
                                        <Select
                                            name="judet"
                                            label="Județ"
                                            placeholder="Alege"
                                            value={this.state.form.judet}
                                            className="form-control"
                                            containerClass="mb-3 col-md-6"
                                            validations={[required]}
                                            autocomplete
                                            onSelect={this.handleCountyChange}
                                            items={counties}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                        <Select
                                            name="localitate"
                                            label="Localitate"
                                            placeholder="Alege"
                                            value={this.state.form.localitate}
                                            className="form-control"
                                            containerClass="mb-3 col-md-6"
                                            validations={[required]}
                                            autocomplete
                                            onSelect={this.handleCityChange}
                                            items={cities}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                    </div>
                                    <div className="row client-autocomplete">
                                        <Select
                                            name="tip_artera"
                                            label="Tip stradă"
                                            placeholder="Alege"
                                            value={this.state.form.tip_artera}
                                            className="form-control"
                                            containerClass="mb-3 col-md-6"
                                            validations={[required]}
                                            onSelect={this.handleInputChange}
                                            items={streetTypes}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                        <Select
                                            name="strada"
                                            label="Stradă"
                                            placeholder="Alege"
                                            value={this.state.form.strada}
                                            className="form-control"
                                            containerClass="mb-3 col-md-6"
                                            validations={[required]}
                                            autocomplete
                                            onSelect={this.handleInputChange}
                                            items={streets}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                    </div>
                                    <div className="row">
                                        <Input
                                            name="nr_strada"
                                            label="Număr"
                                            value={this.state.form.nr_strada}
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                            containerClass="mb-3 col-md-4"
                                            validations={[required, containsDigit, value => maxLength(value, 15)]}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                        <Input
                                            name="bloc"
                                            label="Bloc"
                                            value={this.state.form.bloc}
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                            containerClass="mb-3 col-md-4"
                                            validations={[value => maxLength(value, 10)]}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                        <Input
                                            name="scara"
                                            label="Scară"
                                            value={this.state.form.scara}
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                            containerClass="mb-3 col-md-4"
                                            validations={[]}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                    </div>
                                    <div className="row">
                                        <Input
                                            name="etaj"
                                            label="Etaj"
                                            value={this.state.form.etaj}
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                            containerClass="mb-3 col-md-4"
                                            validations={[]}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                        <Input
                                            name="apartament"
                                            label="Apartament"
                                            value={this.state.form.apartament}
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                            containerClass="mb-3 col-md-4"
                                            validations={[value => maxLength(value, 15)]}
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                        <Input
                                            name="cod_postal"
                                            label="Cod poștal"
                                            value={this.state.form.cod_postal}
                                            onChange={this.handleInputChange}
                                            className="form-control"
                                            containerClass="mb-3 col-md-4"
                                            validations={[codPostal, integer]}
                                            type="number"
                                            disabled={this.isAddressDisabled()}
                                            upperCase
                                        />
                                    </div>
                                    <div className="row">
                                        {/* <Input */}
                                        {/*    name="index" */}
                                        {/*    label="Index Contor" */}
                                        {/*    value={this.state.form.index} */}
                                        {/*    onChange={this.handleInputChange} */}
                                        {/*    className="form-control" */}
                                        {/*    containerClass="mb-3 col-md-4" */}
                                        {/*    validations={[integer]} */}
                                        {/*    type="number" */}
                                        {/*    upperCase */}
                                        {/* /> */}
                                        {
                                            (this.props.session[`${this.props.flow}_schimba_furnizor`] === true &&
                                                this.props.session[`${this.props.flow}_are_furnizare_activa`]) ? ('') : <Input
                                                    name="nr_contract_actual"
                                                    label="Numar Contract Actual"
                                                    value={this.state.form.nr_contract_actual}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[this.isActualContractNumberRequired() ? required : value => maxLength(value, 15)]}
                                                    upperCase
                                                />
                                        }
                                    </div>
                                </div>
                            </fieldset>
                            <div className="text-center offset-top-lg spaced-bottom-md">
                                <button type="submit" className="btn btn-primary col-12" onClick={this.handleNextClick}>
                                    Continuă
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

ClientPlaceInfo.propTypes = propTypes;
ClientPlaceInfo.defaultProps = defaultProps;

const mapStateToProps = state => ({
    invoice: ocrSelectors.getInvoice(state),
    counties: getCounties(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    streets: getStreets(state),
    distributors: getDistributors(state),
    session: getSession(state),
    flow: getFlow(state).toLowerCase(),
    nlc: getNLC(state),
    nlcValidation: getNLCValidation(state),
    nlcInvoiceExamples: getInvoiceExamples(state, 'NLC', getNLC(state) ? getNLC(state).piata : null),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    patchSession,
    fetchDistributors,
    fetchInvoiceExamples,
    fetchCities,
    fetchStreets,
    hideClientPlaceDocs,
    showClientPlaceDocs,
    markAction,
    updateRegistrationInfo,
    hideLoading,
    showLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientPlaceInfo);
