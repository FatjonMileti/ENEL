import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import _ from 'lodash';
import moment from 'moment';

import * as ocrSelectors from 'store/ocr/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getSession } from 'store/session/selectors';
import { getRedirect } from 'store/ui/selectors';

import * as ocrActions from 'store/ocr/actions';
import { patch as patchSession } from 'store/session/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { setRedirect } from 'store/ui/actions';
import { markAction, checkOfferStatus } from 'store/client/actions';

import clientService from 'services/client';
import pageService from 'services/page';
import ocrService from 'services/ocr';
import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Select from 'components/validation/select';
import Button from 'components/validation/button';
import FormErrors from 'components/FormErrors';
import HeaderHero from 'components/heroes/HeaderHero';
import {
    required,
    codPostal,
    earlierThanToday,
    max10,
    serieBuletin,
    tel,
    email,
    integer,
    containsDigit,
    maxLength,
    cnp,
} from 'components/validation/rules';
import './ClientInfoNew.scss';
import { toEnergyInfoSelect } from 'utils/serializers';
import * as selectOptions from 'utils/constants/energyInfo';
import api from 'services/api';

const propTypes = {
    ID: PropTypes.object,
    counties: PropTypes.array,
    cities: PropTypes.array,
    streets: PropTypes.array,
    streetTypes: PropTypes.object,
    session: PropTypes.object,
    patchSession: PropTypes.func.isRequired,
    fetchCities: PropTypes.func.isRequired,
    fetchStreets: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    ID: {},
    counties: [],
    cities: [],
    streets: [],
    streetTypes: {},
    session: {},
};

class ClientInfoNew extends Component {

    form = {
        client: {
            cnp: this.getFromSession('cnp'),
            nume: this.getFromSession('nume') || this.props.ID.lastName || '',
            prenume: this.getFromSession('prenume') || this.props.ID.firstName || '',
            ci_serie: this.getFromSession('ci_serie') || this.props.ID.series || '',
            ci_numar: this.getFromSession('ci_numar') || this.props.ID.seriesNo || '',
            ci_emis_de: this.getFromSession('ci_emis_de') || this.props.ID.issued || '',
            ci_emis_la: this.getFromSession('ci_emis_la'),
            // reusing the address data since these are the same fields for both user and company
            // even though we ahve separated these in the backend for the company
            judet: this.props.session.contract_type !== 'b2b' ? this.getFromSession('judet') : this.getFromSessionBusiness('judet', 'address'),
            localitate: this.props.session.contract_type !== 'b2b' ? this.getFromSession('localitate') : this.getFromSessionBusiness('localitate', 'address'),
            tip_artera: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('tip_artera') : this.getFromSessionBusiness('tip_artera', 'address')) || 'STRADA',
            strada: this.props.session.contract_type !== 'b2b' ? this.getFromSession('strada') : this.getFromSessionBusiness('strada', 'address'),
            nr_strada: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('nr_strada') : this.getFromSessionBusiness('nr_strada', 'address')) || this.getFromIDAddress('streetNo'),
            bloc: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('bloc') : this.getFromSessionBusiness('bloc', 'address')) || this.getFromIDAddress('building'),
            scara: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('scara') : this.getFromSessionBusiness('scara', 'address')) || this.getFromIDAddress('entrance'),
            apartament: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('apartament') : this.getFromSessionBusiness('apartament', 'address')) || this.getFromIDAddress('apartament'),
            etaj: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('etaj') : this.getFromSessionBusiness('etaj', 'address')) || this.getFromIDAddress('floor'),
            cod_postal: (this.props.session.contract_type !== 'b2b' ? this.getFromSession('cod_postal') : this.getFromSessionBusiness('cod_postal', 'address')) || this.getFromIDAddress('postalCode'),
            // end of address data
            telefon_fix: this.getFromSession('telefon_fix'),
            telefon_mobil: this.getFromSession('telefon_mobil'),
            email: this.getFromSession('email'),
            fax: this.getFromSession('fax'),
        },
        company: {
            data_nume: this.getFromSessionBusiness('nume', 'data'),
            data_cui: this.getFromSessionBusiness('cui', 'data'),
            data_telefon_mobil: this.getFromSessionBusiness('telefon_mobil', 'data'),
            data_cod_onrc: this.getFromSessionBusiness('cod_onrc', 'data'),
            data_cod_caen: this.getFromSessionBusiness('cod_caen', 'data'),
            data_tip_companie: this.getFromSessionBusiness('tip_companie', 'data'),
            legal_representative_nume: this.getFromSessionBusiness('nume', 'legal_representative'),
            legal_representative_prenume: this.getFromSessionBusiness('prenume', 'legal_representative'),
            legal_representative_cnp: this.getFromSessionBusiness('cnp', 'legal_representative'),
            legal_representative_rol: this.getFromSessionBusiness('rol', 'legal_representative'),
        },
    };

    formErrors = {
        contactDetails: [],
    };

    state = {
        form: this.form,
        formErrors: this.formErrors,
        idAddressLoaded: {
            county: false,
            city: false,
            streetType: false,
            street: false,
        },
        roles: [],
        companyTypes: [],
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {
        const { contract_type } = this.props.session;
        if (contract_type === 'b2b') {
            const [{ data: roles }, { data: companyTypes }] = await Promise.all([
                api.get('/legal-representative-role'),
                api.get('/company-type')]);
            this.setState({ roles, companyTypes });
        }
        if (this.shouldLoadID(this.props)) {
            this.loadIDAddress(this.props);
        } else {
            this.props.fetchCities(this.state.form.client.judet);
            this.props.fetchStreets(this.state.form.client.judet, this.state.form.client.localitate);
        }

        this.props.markAction(pageService.actions.IDENTIFICARE_CLIENT.value);
    }

    componentWillReceiveProps(nextProps) {
        if (this.shouldLoadID(nextProps)) {
            this.loadIDAddress(nextProps);
        }
    }

    shouldLoadID(props) {
        if (this.getFromSession('judet')) {
            return false;
        }
        return props.ID && this.props.ID.address && this.props.ID.address.county && _.size(props.counties);
    }

    getFromSession(property) {
        if (this.props.session.client) {
            return this.props.session.client[property] || '';
        }
        return '';
    }

    getFromSessionBusiness(field, object) {
        return this.props.session && this.props.session.company && this.props.session.company[object] && this.props.session.company[object][field] || '';
    }

    getFromIDAddress(property) {
        if (this.props.ID && this.props.ID.address) {
            return this.props.ID.address[property] || '';
        }

        return '';
    }

    getFilteredCities() {
        if (this.state.form.client.judet) {
            return _.filter(this.props.cities, city => city.judet == this.state.form.client.judet);
        }
    }

    getFilteredStreets() {
        if (this.state.form.client.localitate) {
            const city = _.find(this.props.cities, city => city.internal_id == this.state.form.client.localitate);

            if (city) {
                return _.filter(this.props.streets, street => street.localitate == city.denumire);
            }
        }
    }

    async loadIDAddress(nextProps) {
        if (nextProps.ID.address) {
            const idAddress = nextProps.ID.address;
            const county = ocrService.matchAddress(nextProps.counties, idAddress.county, 'denumire');
            // eslint-disable-next-line one-var
            let city,
                streetType,
                street;

            if (nextProps.streetTypes && idAddress.streetType) {
                streetType = ocrService.matchAddress(nextProps.streetTypes, idAddress.streetType, 'cod');
                if (streetType && !this.state.idAddressLoaded.streetType) {
                    this.handleInputChange({ target: { name: 'tip_artera', value: streetType.cod } });
                    this.setIDAddressLoaded('streetType');
                }
            }

            if (county) {
                if (!this.state.idAddressLoaded.county) {
                    await this.handleCountyChange({ target: { value: county.denumire } });
                    this.setIDAddressLoaded('county');
                }
                if (_.size(nextProps.cities)) {
                    city = ocrService.matchAddress(nextProps.cities, idAddress.city, 'denumire');
                }
            }

            if (city) {
                if (!this.state.idAddressLoaded.city) {
                    await this.handleCityChange({ target: { value: city.internal_id } });
                    this.setIDAddressLoaded('city');
                }
                if (_.size(nextProps.streets)) {
                    street = ocrService.matchAddress(nextProps.streets, idAddress.streetName, 'denumire');
                }
            }

            if (street && !this.state.idAddressLoaded.street) {
                this.handleInputChange({ target: { name: 'strada', value: street.internal_id } });
                this.setIDAddressLoaded('street');
            }
        }
    }

    setIDAddressLoaded(prop) {
        this.setState({
            idAddressLoaded: _.extend(this.state.idAddressLoaded, {
                [prop]: true,
            }),
        });
    }

    handleInputChange(e, isBusinessValue) {
        const entity = isBusinessValue ? 'company' : 'client';
        const { name, value } = e.target;
        this.setState(state => ({
            form: {
                ...state.form,
                [entity]: {
                    ...state.form[entity],
                    [name]: value,
                },
            },
        }));
    }

    handleCountyChange(e) {
        return new Promise((resolve) => {
            this.setState({
                form: {
                    ...this.state.form,
                    client: {
                        ...this.state.form.client,
                        judet: e.target.value,
                        localitate: '',
                        strada: '',
                    },
                },
            }, async () => {
                await this.props.fetchCities(e.target.value);
                resolve();
            });
        });
    }

    handleCityChange(e) {
        return new Promise((resolve) => {
            this.setState({
                form: {
                    ...this.state.form,
                    client: {
                        ...this.state.form.client,
                        localitate: e.target.value,
                        strada: '',
                    },
                },
            }, async () => {
                await this.props.fetchStreets(this.state.form.client.tip_artera, e.target.value);
                resolve();
            });
        });
    }

    async handleNextClick(e) {
        e.preventDefault();
        this.resetFormErrors();
        this.form.validateAll();
        this.validateName();
        if (this.props.session.contract_type === 'b2b') {
            await this.validateONRC();
        }
        // try {
        //     const clientData = this.state.form;
        //     await this.props.checkOfferStatus(clientData.cnp, clientData.email, clientData.telefon_mobil, this.props.session.type);
        // } catch (err) {
        //     const { formErrors } = this.state;
        //     formErrors.contactDetails.push(err.message);
        //     this.setState({ formErrors });
        // }

        if (this.noErrors()) {
            const { form } = this.state;
            const {session} = this.props
            await this.props.patchSession({ client_update_cross: true });
            if (this.props.session.contract_type === 'b2b') {

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event' : 'online_contract',
                    'step': 7,
                    'business_type': form.company.data_tip_companie,
                    'legal_repr': form.company.legal_representative_rol,
                    'client_type': session.contract_type === "b2c" ? "residential" : "business",
                    'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                });
                await this.props.patchSession({
                    company: {
                        data: {
                            nume: form.company.data_nume,
                            cui: form.company.data_cui,
                            telefon_mobil: form.company.data_telefon_mobil,
                            cod_onrc: form.company.data_cod_onrc,
                            cod_caen: form.company.data_cod_caen,
                            tip_companie: form.company.data_tip_companie,
                        },
                        legal_representative: {
                            nume: form.company.legal_representative_nume,
                            prenume: form.company.legal_representative_prenume,
                            cnp: form.company.legal_representative_cnp,
                            rol: form.company.legal_representative_rol,
                        },
                        address: {
                            judet: form.client.judet,
                            localitate: form.client.localitate,
                            tip_artera: form.client.tip_artera,
                            strada: form.client.strada,
                            nr_strada: form.client.nr_strada,
                            bloc: form.client.bloc,
                            scara: form.client.scara,
                            apartament: form.client.apartament,
                            etaj: form.client.etaj,
                            cod_postal: form.client.cod_postal,
                        },
                    },
                });
            } else {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event' : 'online_contract',
                    'step': 7,
                    'client_type': session.contract_type === "b2c" ? "residential" : "business",
                    'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                });
                await this.props.patchSession({ client: form.client });
            }

            pageService.scrollToTop();
            browserHistory.push(pageService.links['client-invoice-scan']);
        } else {
            pageService.scrollToError();
        }
    }

    noErrors() {
        if (!_.isNil(_.find(this.state.formErrors, section => section.length > 0))) return false;
        return !(this.form.getChildContext()._errors.length > 0);
    }

    validateName() {
        const contract_type = this.props.session.contract_type;
        const client1 = {
            firstName: this.props.session.prenume,
            lastName: this.props.session.nume,
        };
        const client2 = {
            firstName: this.state.form.client.prenume,
            lastName: this.state.form.client.nume,
        };
        if (contract_type === 'b2c' && !clientService.matchName(client1, client2) ||
            contract_type === 'b2b' && this.props.session.company.data.nume !== this.state.form.company.data_nume) {
            const { formErrors } = this.state;
            formErrors.contactDetails.push(
                <span>
                    Acordul de preluare și procesare date a fost dat pentru ({contract_type === 'b2b' ? this.props.session.company.data.nume : `${client1.firstName} ${client1.lastName}`}). Datele nu coincid cu datele de identitate de mai jos. Reveniți la pasul <a
                        href="#"
                        onClick={this.handleRedirectClick}
                    >Acord de preluare și procesare date</a> sau editați datele de mai jos.
                </span>
            );
            this.setState({
                formErrors,
            });
        }
    }

    async validateONRC() {
        const cod_onrc = this.state.form.company.data_cod_onrc;
        if (cod_onrc !== '' && cod_onrc) {
            const onrcValidation = await api.get(`/validate-onrc/?onrc=${cod_onrc}`);
            if (onrcValidation !== 'OK') {
                const { formErrors } = this.state;
                formErrors.contactDetails.push(
                    <span>
                        Cod ONRC este invalid
                    </span>
                );
                this.setState({
                    formErrors,
                });
            }
        }
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
    }

    handleRedirectClick(e) {
        e.preventDefault();
        this.props.setRedirect(pageService.links['client-info-new']);
        browserHistory.push(pageService.links.agreement);
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
        const counties = _.map(this.props.counties, v => ({ value: v.denumire, label: v.denumire }));
        const cities = _.map(this.getFilteredCities(), v => ({ value: v.internal_id, label: v.denumire }));
        const streetTypes = _.map(this.props.streetTypes, v => ({ value: v.cod, label: v.cod }));
        const streets = _.map(this.getFilteredStreets(), v => ({ value: v.internal_id, label: v.denumire }));
        const { contract_type } = this.props.session;
        return (
            <div className="ClientInfoNew">
                <HeaderHero
                    title="Completează datele"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <div className="page-description" />
                <div className="main-content bottom-margin" >
                    <div className="row">
                        <Form
                            className="needs-validation"
                            noValidate
                            ref={(c) => {
                                this.form = c;
                            }}
                        >
                            {contract_type === 'b2b' ? (
                                <Fragment>
                                    <fieldset>
                                        <div className="order-md-1 col-md-12">
                                            {this.renderFormErrors('contactDetails')}
                                            <h4 className="mb-3">Identificare societate comerciala</h4>
                                            <div className="row">
                                                <Input
                                                    name="data_nume"
                                                    label="Nume societate comerciala "
                                                    value={this.state.form.company.data_nume}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="data_cui"
                                                    label="CUI"
                                                    value={this.state.form.company.data_cui}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="data_telefon_mobil"
                                                    label="Telefon"
                                                    value={this.state.form.company.data_telefon_mobil}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="data_cod_onrc"
                                                    label="Cod ONRC"
                                                    value={this.state.form.company.data_cod_onrc}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="data_cod_caen"
                                                    label="Cod CAEN"
                                                    value={this.state.form.company.data_cod_caen}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                                <Select
                                                    name="data_tip_companie"
                                                    label="Tip societate "
                                                    placeholder="Alege"
                                                    value={this.state.form.company.data_tip_companie}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    onSelect={e => this.handleInputChange(e, true)}
                                                    items={this.state.companyTypes}
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <div className="order-md-1 col-md-12">
                                            <h4
                                                className="mb-3"
                                                data-pgc="enel.fieldset-title"
                                                data-pgc-no-update="data-pgc-no-update"
                                            >Adresa de domiciliu</h4>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="judet"
                                                    label="Județ"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.judet}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleCountyChange}
                                                    items={counties}
                                                    upperCase
                                                />
                                                <Select
                                                    name="localitate"
                                                    label="Localitate"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.localitate}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleCityChange}
                                                    items={cities}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="tip_artera"
                                                    label="Tip stradă"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.tip_artera}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    onSelect={this.handleInputChange}
                                                    items={streetTypes}
                                                />
                                                <Select
                                                    name="strada"
                                                    label="Stradă"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.strada}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleInputChange}
                                                    items={streets}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="nr_strada"
                                                    label="Număr"
                                                    value={this.state.form.client.nr_strada}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[required, containsDigit]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="bloc"
                                                    label="Bloc"
                                                    value={this.state.form.client.bloc}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[value => maxLength(value, 10)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="scara"
                                                    label="Scară"
                                                    value={this.state.form.client.scara}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[]}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="etaj"
                                                    label="Etaj"
                                                    value={this.state.form.client.etaj}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="apartament"
                                                    label="Apartament"
                                                    value={this.state.form.client.apartament}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[value => maxLength(value, 15)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="cod_postal"
                                                    label="Cod poștal"
                                                    value={this.state.form.client.cod_postal}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[codPostal, integer]}
                                                    type="number"
                                                    upperCase
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <div className="order-md-1 col-md-12">
                                            {this.renderFormErrors('contactDetails')}
                                            <h4 className="mb-3">Indentificare reprezentant legal</h4>
                                            <div className="row">
                                                <Input
                                                    name="legal_representative_prenume"
                                                    label="Prenume"
                                                    value={this.state.form.company.legal_representative_prenume}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="legal_representative_nume"
                                                    label="Nume"
                                                    value={this.state.form.company.legal_representative_nume}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="legal_representative_cnp"
                                                    label="CNP"
                                                    value={this.state.form.company.legal_representative_cnp}
                                                    onChange={e => this.handleInputChange(e, true)}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required, cnp]}
                                                    upperCase
                                                />
                                                <Select
                                                    name="legal_representative_rol"
                                                    label="Rol reprezentat "
                                                    placeholder="Alege"
                                                    value={this.state.form.company.legal_representative_rol}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    onSelect={e => this.handleInputChange(e, true)}
                                                    items={this.state.roles}
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <fieldset>
                                        <div className="order-md-1 col-md-12">
                                            {this.renderFormErrors('contactDetails')}
                                            <h4 className="mb-3">Date de identitate</h4>
                                            <div className="row">
                                                <Input
                                                    name="prenume"
                                                    label="Prenume"
                                                    value={this.state.form.client.prenume}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="nume"
                                                    label="Nume"
                                                    value={this.state.form.client.nume}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="ci_serie"
                                                    label="Serie CI"
                                                    value={this.state.form.client.ci_serie}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required, serieBuletin]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="ci_numar"
                                                    label="Număr CI"
                                                    value={this.state.form.client.ci_numar}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required, max10, integer]}
                                                    type="number"
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="ci_emis_de"
                                                    label="Emis de"
                                                    value={this.state.form.client.ci_emis_de}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required, value => maxLength(value, 64)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="ci_emis_la"
                                                    label="Emis la"
                                                    value={this.state.form.client.ci_emis_la}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    type="date"
                                                    dateFormat="DD.MM.YYYY"
                                                    validations={[required, earlierThanToday]}
                                                    upperCase
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <div className="order-md-1 col-md-12">
                                            <h4
                                                className="mb-3"
                                                data-pgc="enel.fieldset-title"
                                                data-pgc-no-update="data-pgc-no-update"
                                            >Adresa de domiciliu</h4>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="judet"
                                                    label="Județ"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.judet}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleCountyChange}
                                                    items={counties}
                                                    upperCase
                                                />
                                                <Select
                                                    name="localitate"
                                                    label="Localitate"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.localitate}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleCityChange}
                                                    items={cities}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row client-autocomplete">
                                                <Select
                                                    name="tip_artera"
                                                    label="Tip stradă"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.tip_artera}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    onSelect={this.handleInputChange}
                                                    items={streetTypes}
                                                />
                                                <Select
                                                    name="strada"
                                                    label="Stradă"
                                                    placeholder="Alege"
                                                    value={this.state.form.client.strada}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    validations={[required]}
                                                    autocomplete
                                                    onSelect={this.handleInputChange}
                                                    items={streets}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="nr_strada"
                                                    label="Număr"
                                                    value={this.state.form.client.nr_strada}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[required, containsDigit, value => maxLength(value, 15)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="bloc"
                                                    label="Bloc"
                                                    value={this.state.form.client.bloc}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[value => maxLength(value, 10)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="scara"
                                                    label="Scară"
                                                    value={this.state.form.client.scara}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[]}
                                                    upperCase
                                                />
                                            </div>
                                            <div className="row">
                                                <Input
                                                    name="etaj"
                                                    label="Etaj"
                                                    value={this.state.form.client.etaj}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="apartament"
                                                    label="Apartament"
                                                    value={this.state.form.client.apartament}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[value => maxLength(value, 15)]}
                                                    upperCase
                                                />
                                                <Input
                                                    name="cod_postal"
                                                    label="Cod poștal"
                                                    value={this.state.form.client.cod_postal}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    validations={[codPostal, integer]}
                                                    type="number"
                                                    upperCase
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <div className="order-md-1 col-md-12">
                                            <h4 className="mb-3">Date de contact</h4>
                                            <div className="row">
                                                <Input
                                                    name="telefon_mobil"
                                                    label="Telefon mobil"
                                                    value={this.state.form.client.telefon_mobil}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    type="tel"
                                                    validations={[required, tel]}
                                                    upperCase
                                                    disabled
                                                />
                                                <Input
                                                    name="email"
                                                    label="E-mail"
                                                    value={this.state.form.client.email}
                                                    onChange={this.handleInputChange}
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-6"
                                                    type="email"
                                                    validations={[required, email]}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                </Fragment>
                            )}
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

ClientInfoNew.propTypes = propTypes;
ClientInfoNew.defaultProps = defaultProps;

const mapStateToProps = state => ({
    ID: ocrSelectors.getId(state),
    counties: countiesSelectors.getItems(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    streets: getStreets(state),
    session: getSession(state),
    redirectTo: getRedirect(state),
});

const mapDispatchToProps = {
    fetchCities,
    fetchStreets,
    patchSession,
    setRedirect,
    markAction,
    checkOfferStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientInfoNew);
