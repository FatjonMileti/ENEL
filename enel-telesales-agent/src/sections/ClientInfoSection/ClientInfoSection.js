/* eslint-disable linebreak-style */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';
import api from '../../services/api';

import { isDocLoading } from 'store/ui/selectors';
import { setDocLoading, unsetDocLoading } from 'store/ui/actions';

import { getUser as getAuthUser } from 'store/auth/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getItems as getCampaigns } from 'store/campaigns/selectors';
import { getItems as getDiscounts } from 'store/discounts/selectors';
import {
    getClient,
    hasClientSignedAgreement,
    isFastFlux,
    isLinkSent,
} from 'store/client/selectors';
import { getContractType, getSession, isContractSent } from 'store/session/selectors';
import {
    getID,
    getRegistrationFisc,
    getPowerOfAttorney,
    getDocConstituive,
    getDocs,
    getTimestamps,
    getPowerOfAttorneyOrReg,
} from 'store/documents/selectors';
import { isPlanSelected } from 'store/offers/selectors';

import { DocList } from 'components/docs/DocList';
import { megaBytesToBytes } from 'utils';

import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { fetchAllItems as fetchDistributors } from 'store/distributors/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import {
    fetchID,
    deleteDoc,
    setDoc,
    uploadID,
    fetchDocs,
    uploadRegistrationFisc,
    uploadPowerOfAttorneyOrReg,
} from 'store/documents/actions';
import { checkCNP, checkEmail, checkTel } from 'store/client/actions';
import { create as createSession, patch as patchSession } from 'store/session/actions';
import { fetchAllItems as fetchDiscounts } from 'store/discounts/actions';

import { mix, requiredBefore, cnp, email, tel, cui, required } from 'services/rules';
import pageService from 'services/page';
import { addFormError, checkForm, getFromForm, noFormErrors, resetFormErrors } from 'services/form';
import FileService from 'services/file';

import InsuranceOptions from 'sections/ClientInfoSection/components/InsuranceOptions';
import Discounts from 'sections/ClientInfoSection/components/Discounts';
import Document from 'sections/ClientInfoSection/components/Document';
import MarketingOptions from 'sections/ClientInfoSection/components/MarketingOptions';
import ClientAddress from 'sections/ClientInfoSection/components/ClientAddress';
import IdentityData from 'sections/ClientInfoSection/components/IdentityData';
import MarketingPurposesCommunication from 'sections/ClientInfoSection/components/MarketingPurposesCommunication';
import ClientIdentification from 'sections/ClientInfoSection/components/ClientIdentification';
import ContactData from 'sections/ClientInfoSection/components/ContactData';
import { Cropper } from 'components/Cropper';
import CardSelection from './components/CardSelection';
import CompanyIdentification from './components/CompanyIdentification';

import { Form, FormErrors, Radio, Text } from 'components/form';
import Section from 'components/Section';
import { Button } from 'components/Button';
import { ROLES } from 'services/user';

import './ClientInfoSection.scss';
import Documents from '../PlaceInfoSection/components/Documents';
import CustomerDocsSelect from '../PlaceInfoSection/components/CustomerDocsSelect';

const TYPES = {
    REGISTRATION_FISC_CERT: 'Certificat de inregistrare societate',
    IMPUTERNICIRE_OR_DOC_CONSTITUIVE:
        'Imputernicire/Certificat constator de la registrul comertului',
};

class ClientInfoSection extends Component {
    static propTypes = {
        onNextClick: PropTypes.func.isRequired,
    };

    formErrors = {
        cnp: [],
        contract: [],
        contact: [],
        channel: [],
        cui: [],
        company_data_tip_companie: [],
    };

    state = {
        cityLoaded: false,
        contact_acord_protect: false,
        contact_acord_mkt_generali: false,
        contact_pers_publica_generali: false,

        canal_email: '',
        canal_telefon: '',

        contact_acord_mk: undefined,
        contact_acord_part: undefined,
        contact_acord_profil: undefined,

        contact_canal_email: false,

        contact_canal_sms: false,

        contact_canal_telefon: false,

        contact_canal_posta: false,
        isValid: true,
        isValidationLoading: false,
        formErrors: this.formErrors,
        formSuccess: '',
        docSelection: false,
        insurance: {
            isValid: true,
        },
        cropImage: null,
        docType: '',
        docs: {
            ee: {
                REGISTRATION_FISC_CERT: {
                    title: TYPES.REGISTRATION_FISC_CERT,
                    images: [],
                },
                IMPUTERNICIRE_OR_DOC_CONSTITUIVE: {
                    title: TYPES.IMPUTERNICIRE_OR_DOC_CONSTITUIVE,
                    images: [],
                },
            },
            gaz: {
                REGISTRATION_FISC_CERT: {
                    title: TYPES.REGISTRATION_FISC_CERT,
                    images: [],
                },
                IMPUTERNICIRE_OR_DOC_CONSTITUIVE: {
                    title: TYPES.IMPUTERNICIRE_OR_DOC_CONSTITUIVE,
                    images: [],
                },
            },
        },
    };

    insuranceErrorModal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.onMount(this);
        this.props.fetchStreetTypes();
    }

    async componentDidUpdate(prevProps) {
        const { session, isEdit } = this.props;
        if (isEdit && _.isEmpty(prevProps.session) && !_.isEmpty(session)) {
            if (session.contract_type === 'b2b') {
                this.loadSessionCompany();
            } else await this.loadSessionClient();
            this.loadSessionContact();
            this.loadSessionInsurance();
            this.loadSessionDiscounts();
        }

        const { docs } = this.props;

        if (docs) {
            const flow = this.getFlowType();
            _.map(TYPES, (value, key) => {
                const docsFirstLoaded =
                    prevProps.docs[flow.toLowerCase()] &&
                    !prevProps.docs[flow.toLowerCase()][key] &&
                    this.props.docs[flow.toLowerCase()][key] &&
                    this.props.docs[flow.toLowerCase()][key].length > 0;

                const docsUpdated =
                    prevProps.timestamps[flow.toLowerCase()][key] !==
                    this.props.timestamps[flow.toLowerCase()][key];

                if (docsFirstLoaded || docsUpdated) {
                    this.setImages(this.props.docs[flow.toLowerCase()][key], key, 0);
                }
            });
        }
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    setImages(images, docType) {
        return new Promise(resolve => {
            const flow = this.getFlowType();
            const type = docType || this.state.docType;
            let docs = { ...this.state.docs };
            if (!docs[flow][type]) {
                this.initDoc(docs, type, images);
            } else {
                docs[flow][type].images = [...images];
            }
            this.props.setDoc([...docs[flow][type].images], type, flow);
            resolve();
        });
    }

    async loadSessionDiscounts() {
        if (!this.props.discounts.length) {
            await this.props.fetchDiscounts();
        }
    }

    async loadSessionCompany() {
        const { company } = this.props.session;

        let companyObj = {};
        if (company.data) {
            _.map(company.data, (value, key) => {
                companyObj[`company_data_${key}`] = value;
            });
        }
        if (company.address) {
            _.map(company.address, (value, key) => {
                companyObj[`company_address_${key}`] = value;
            });
        }
        if (company.legal_representative) {
            _.map(company.legal_representative, (value, key) => {
                companyObj[`reprezentant_legal_${key}`] = value;
            });
        }

        if (company.address.judet) {
            await this.props.fetchCities(company.address.judet);
            this.formApi.setValue('company_address_judet', company.address.judet);
            this.setState({ countyLoaded: true });
            if (company.address.localitate) {
                await this.props.fetchStreets(company.address.localitate);
                this.formApi.setValue('company_address_localitate', company.address.localitate);
                this.setState({ cityLoaded: true }, () => {
                    this.formApi.setValue('company_address_strada', company.address.strada);
                });
            }
        }

        this.formApi.setValues(companyObj);
    }

    async loadSessionClient() {
        const { client } = this.props.session;
        const data = _.transform(client, (result, value, key) => {
            result[`client_${key}`] = value;
        });

        data.client_ci_emis_la = client.ci_emis_la
            ? moment(client.ci_emis_la, 'YYYY-MM-DD').format('DD.MM.YYYY')
            : '';

        if (client.judet) {
            await this.props.fetchCities(client.judet);
            this.formApi.setValue('client_judet', client.judet);
            this.setState({ countyLoaded: true });
            if (client.localitate) {
                await this.props.fetchStreets(client.localitate);
                this.formApi.setValue('client_localitate', client.localitate);
                this.setState({ cityLoaded: true }, () => {
                    this.formApi.setValue('client_strada', client.strada);
                });
            }
        }

        this.formApi.setValues(data);
    }

    async loadSessionContact() {
        const contact = this.props.session.ee_contact;
        const data = _.transform(contact, (result, value, key) => {
            result[`contact_${key}`] = value;
        });

        this.setState({
            contact_acord_mk: contact.acord_mk,
            contact_acord_part: contact.acord_part,
            contact_acord_profil: contact.acord_profil,
            contact_canal_email: !!contact.canal_email,
            contact_canal_sms: !!contact.canal_sms,
            contact_canal_telefon: !!contact.canal_telefon,
        });

        if (contact.acord_protect) {
            await this.handleStateCheckbox({ target: { name: 'acord_protect', checked: true } });
        }

        if (contact.canal_posta) {
            await this.handleStateCheckbox({
                target: { name: 'contact_canal_posta', checked: true },
            });
        }

        this.formApi.setValues(data);

        const address = _.transform(contact.canal_posta_adresa, (result, value, key) => {
            result[`canal_posta_${key}`] = value;
        });

        // if (contact.canal_posta && address.canal_posta_judet) {
        //     await this.props.fetchCities(address.canal_posta_judet);
        //     this.formApi.setValue('canal_posta_judet', address.canal_posta_judet);
        //     this.setState({ countyLoaded: true });
        //     if (address.canal_posta_localitate) {
        //         await this.props.fetchStreets(address.canal_posta_localitate);
        //         this.formApi.setValue('canal_posta_localitate', address.canal_posta_localitate);
        //         this.setState({ cityLoaded: true }, () => {
        //             this.formApi.setValue('canal_posta_strada', address.canal_posta_strada);
        //         });
        //     }
        // }

        this.formApi.setValues(address);

        if (contact.email) {
            this.formApi.setValue('canal', 'email');
            this.handleChannelSelection({ target: { value: 'email' } }, contact.email);
        } else if (contact.telefon) {
            this.formApi.setValue('canal', 'telefon');
            this.handleChannelSelection({ target: { value: 'telefon' } }, contact.telefon);
        }
    }

    loadSessionInsurance() {
        const contact = this.props.session.ee_contact;
        this.formApi.setValues({
            contact_acord_protect: contact.acord_protect,
            contact_acord_mkt_generali: contact.acord_mkt_generali,
            contact_pers_publica_generali: contact.pers_publica_generali,
        });
        this.setState({ insuranceLoaded: true });
    }

    formatIssueDate(idCardIssuedOn) {
        if (idCardIssuedOn) {
            let issueDate = moment(idCardIssuedOn);
            if (!issueDate.isValid()) {
                issueDate = moment(idCardIssuedOn, 'DD-MMM-YY');
            }
            return issueDate.isValid() ? issueDate.format('DD.MM.YYYY') : '';
        }

        return '';
    }

    getCampaignsAgreement() {
        const form = this.formApi.getState().values;
        return _.map(this.props.campaigns, campaign => ({
            id: campaign.id,
            acord_concurs: form[`campaign_${campaign.id}`] ? '1' : '0',
        }));
    }

    getDiscountsAgreement() {
        const form = this.formApi.getState().values;
        let ids = Object.keys(this.props.discounts);
        let discounts = [];
        for (const id of ids) {
            if (form[`discounts_${this.props.discounts[id].DiscountID}`])
                discounts.push(this.props.discounts[id].DiscountID);
        }
        return discounts;
    }

    getFlowType() {
        const { session } = this.props;
        return !session && !session.type ? session.type.toLowerCase() : 'ee';
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    isValid() {
        return this.state.isValid && this.state.insurance.isValid && noFormErrors(this);
    }

    showInsuranceErrorModal() {
        this.insuranceErrorModal.current.show();
        this.setState({
            insurance: {
                isValid: true,
            },
        });
    }

    validateInsuranceAgreement() {
        return new Promise(resolve => {
            const { contact_acord_protect } = this.formApi.getState().values;
            const { session } = this.props;
            const offer = _.isEmpty(session.ee_serviciu)
                ? session.gaz_serviciu
                : session.ee_serviciu;
            this.setState(
                {
                    insurance: {
                        isValid: !offer || !offer.tipOfertaAsigurat || !!contact_acord_protect,
                    },
                },
                resolve
            );
        });
    }

    async validateCNP(contractType) {
        const { values } = this.formApi.getState();
        let error = '';

        if (contractType === 'b2b') {
            if (!values.reprezentant_legal_cnp) {
                error = 'CNP este obligatoriu.';
            } else {
                error = cnp(values.reprezentant_legal_cnp);
            }
        } else if (contractType === 'b2c') {
            if (!values.client_cnp) {
                error = 'CNP este obligatoriu.';
            } else {
                error = cnp(values.client_cnp);
            }
        }

        if (error) {
            await addFormError(this, 'cnp', error);
        }
    }

    async validateCUI() {
        const { values } = this.formApi.getState();
        let error = '';
        if (!values.company_data_cui) {
            error = 'CUI este obligatoriu.';
        } else {
            error = cui(values.company_data_cui);
        }

        if (error) {
            await addFormError(this, 'cui', error);
        }
    }

    async validateTipSocietate() {
        const { values } = this.formApi.getState();
        let error = '';
        if (!values.company_data_tip_companie) {
            error = 'Tip societate este obligatoriu.';
        } else {
            error = required(values.company_data_tip_companie);
        }

        if (error) {
            await addFormError(this, 'company_data_tip_companie', error);
        }
    }

    async validateCodONRC() {
        const { values } = this.formApi.getState();
        let error = '';
        if (values.company_data_cod_onrc) {
            const onrcValidation = await api.get(
                `/validate-onrc/?onrc=${values.company_data_cod_onrc}`
            );
            if (onrcValidation !== 'OK') {
                error = 'Cod ONRC est invalid.';
            }
        }

        if (error) {
            await addFormError(this, 'company_data_cod_onrc', error);
        }
    }

    async validateSendContract() {
        const { canal_email, canal_telefon } = this.state;
        if (!canal_email && !canal_telefon) {
            const error = 'Trebuie sa alegi modul de transmitere al contractului.';
            await addFormError(this, 'contract', error);
        }
    }

    async validateContactPhone() {
        const { values } = this.formApi.getState();
        if (
            !values.client_telefon_mobil &&
            !values.client_telefon_fix &&
            !values.reprezentant_legal_telefon_mobil
        ) {
            const error = 'Trebuie introdus telefonul mobil sau fix.';
            await addFormError(this, 'contact', error);
        }
    }

    async validateMarketingChannel() {
        if (
            this.state.contact_acord_mk === undefined ||
            this.state.contact_acord_part === undefined ||
            this.state.contact_acord_profil === undefined
        ) {
            const error =
                'Trebuie sa bifezi optiunile de comunicare marketing de mai jos pentru a continua procesul.';
            await addFormError(this, 'channel', error);
        }

        if (
            (this.state.contact_acord_mk || this.state.contact_acord_part) &&
            !this.state.contact_canal_sms &&
            !this.state.contact_canal_telefon &&
            !this.state.contact_canal_email &&
            !this.state.contact_canal_posta
        ) {
            const error =
                'Trebuie să alegi cel puțin un canal de comunicare în scopuri de marketing.';
            await addFormError(this, 'channel', error);
        }
    }

    /* NO blacklist check required on Telesales */
    async checkBlacklist() {
        await checkEmail(this, 'client_email', 'contact');
        await checkEmail(this, 'contact_email', 'contract');
        await checkEmail(this, 'contact_canal_email_text', 'channel');
        await checkTel(this, 'client_telefon_mobil', 'contact');
        await checkTel(this, 'client_telefon_mobil_alternativ', 'contact');
        await checkTel(this, 'client_telefon_fix', 'contact');
        await checkTel(this, 'contact_telefon', 'contract');
        await checkTel(this, 'contact_canal_telefon_text', 'channel');
        await checkTel(this, 'contact_canal_sms_text', 'channel');
    }

    async validate() {
        await resetFormErrors(this);
        await checkForm(this);
        if (this.props.session.contract_type === 'b2b') {
            await this.validateTipSocietate();
            await this.validateCodONRC();
        }
        await this.validateSendContract();
        await this.validateContactPhone();
        await this.validateMarketingChannel();
        if (this.props.isPlanSelected) {
            await this.validateInsuranceAgreement();
        }
    }

    async uploadDocs(images) {
        const { setDocLoading, unsetDocLoading } = this.props;
        const flow = this.getFlowType();
        const { docType } = this.state;
        //handling the "general" documents
        if (docType !== 'id') {
            setDocLoading(flow, docType);
            if (docType === 'REGISTRATION_FISC_CERT') {
                await this.props.uploadRegistrationFisc(images, flow.toUpperCase());
            } else if (docType === 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE') {
                await this.props.uploadPowerOfAttorneyOrReg(images, flow.toUpperCase());
            }
            unsetDocLoading(flow, docType);
        }
        //handle dhe it like it was before
        else {
            await this.props.uploadID(images[0]);
        }
    }

    canUploadDocs() {
        const { authUser, isFastFlux, hasClientSignedAgreement } = this.props;
        return (
            !isFastFlux &&
            authUser &&
            (authUser.role === ROLES.CM || authUser.role === ROLES.AGENT) &&
            hasClientSignedAgreement
        );
    }

    async handleChannelSelection(e, value) {
        const { values } = this.formApi.getState();
        if (e.target.value === 'email') {
            this.setState({
                canal_email: e.target.value,
                canal_telefon: '',
            });
            setTimeout(() => {
                this.formApi.setValue(
                    'contact_email',
                    value || values.client_email || values.company_data_email
                );
                this.formApi.setValue('contact_telefon', '');
            }, 250);
        } else {
            this.setState({
                canal_email: '',
                canal_telefon: e.target.value,
            });
            setTimeout(() => {
                this.formApi.setValue(
                    'contact_telefon',
                    value ||
                        values.client_telefon_mobil ||
                        values.client_telefon_fix ||
                        values.company_data_telefon_mobil
                );
                this.formApi.setValue('contact_email', '');
            }, 250);
        }
    }

    handleAddressCheckbox(e) {
        if (e.target.checked) {
            this.handleStateCheckbox(e);
            // setTimeout(async () => {
            //     const { values } = this.formApi.getState();
            //     if (values.client_judet) {
            //         await this.props.fetchCities(values.client_judet);
            //         this.formApi.setValue('canal_posta_judet', values.client_judet);
            //         this.setState({ countyLoaded: true });
            //         if (values.client_localitate) {
            //             await this.props.fetchStreets(values.client_localitate);
            //             this.formApi.setValue('canal_posta_localitate', values.client_localitate);
            //             this.setState({ cityLoaded: true }, () => {
            //                 this.formApi.setValue('canal_posta_strada', values.client_strada);
            //             });
            //         }
            //     }

            //     this.formApi.setValues({
            //         canal_posta_tip_artera: values.client_tip_artera,
            //         canal_posta_nr_strada: values.client_nr_strada,
            //         canal_posta_bloc: values.client_bloc,
            //         canal_posta_scara: values.client_scara,
            //         canal_posta_etaj: values.client_etaj,
            //         canal_posta_apartament: values.client_apartament,
            //         canal_posta_cod_postal: values.client_cod_postal,
            //     });
            // }, 250);
        } else {
            this.handleStateCheckbox(e);
        }
    }

    handleStateCheckbox(e) {
        return new Promise(resolve => {
            this.setState(
                {
                    [e.target.name]: e.target.checked,
                },
                () => {
                    resolve();
                }
            );
        });
    }

    async handleCountyChange(e, prefix) {
        await this.props.fetchCities(e.target.value);
        this.formApi.setValues({
            [`${prefix}localitate`]: '',
            [`${prefix}strada`]: '',
        });
    }

    async handleCityChange(e, prefix) {
        await this.props.fetchStreets(e.target.value);
        this.formApi.setValues({ [`${prefix}strada`]: '' });
    }

    async handleDelete() {
        await this.props.deleteDoc('CI', 'EE');
        await this.props.deleteDoc('CI', 'GAZ');
        this.props.fetchID();
    }

    async handleNextClick(e) {
        await this.validate();

        if (this.isValid()) {
            if (!this.props.session.id) {
                await this.props.createSession();
            }
            // NO BLACKLIST check on Telesales
            await this.checkBlacklist();
            if (this.isValid()) {
                const client = getFromForm(this.formApi, 'client_');
                const contact = getFromForm(this.formApi, 'contact_');
                const company_data = getFromForm(this.formApi, 'company_data_');
                const reprezentant_legal = getFromForm(this.formApi, 'reprezentant_legal_');
                const company_address = getFromForm(this.formApi, 'company_address_');

                // TODO: Remove this after the sessions are fixed
                if (client.ci_emis_la === 'Invalid date') {
                    await this.props.checkCNP(client.cnp, 'cnp');
                    const { idCardIssuedOn } = this.props.client;
                    client.ci_emis_la = this.formatIssueDate(idCardIssuedOn);
                }

                if (client.ci_emis_la) {
                    client.ci_emis_la = moment(client.ci_emis_la, 'DD.MM.YYYY').format(
                        'YYYY-MM-DD'
                    );
                }

                await this.props.patchSession({ client });
                await this.props.patchSession({
                    nume: client.nume,
                    prenume: client.prenume,
                    client_update_cross: true,
                    _contact: {
                        email: contact.email || '',
                        telefon: contact.telefon || '',

                        acord_mk: this.state.contact_acord_mk || false,
                        acord_part: this.state.contact_acord_part || false,
                        acord_profil: this.state.contact_acord_profil || false,

                        acord_protect: contact.acord_protect || false,
                        acord_mkt_generali: contact.acord_mkt_generali || false,
                        pers_publica_generali: contact.pers_publica_generali || false,
                        canal_email: this.state.contact_canal_email || false,
                        canal_email_text: contact.canal_email_text || '',
                        canal_posta: contact.canal_posta || false,
                        canal_posta_adresa: getFromForm(this.formApi, 'canal_posta_'),
                        canal_sms: this.state.contact_canal_sms || false,
                        canal_sms_text: contact.canal_sms_text || '',
                        canal_telefon: this.state.contact_canal_telefon || false,
                        canal_telefon_text: contact.canal_telefon_text || '',
                        concursuri: await this.getCampaignsAgreement(),
                        discounts: await this.getDiscountsAgreement(),
                    },
                    company: {
                        data: company_data,
                        address: company_address,
                        legal_representative: reprezentant_legal,
                    },
                });

                if (e) this.props.onNextClick();
            } else {
                pageService.scrollToError();
            }
        } else {
            if (!this.state.insurance.isValid && e) {
                this.showInsuranceErrorModal();
            } else {
                if (e) pageService.scrollToError();
            }
        }
    }

    async fillAddressData(client, fieldNamePrefix) {
        if (client.districtId) {
            await this.props.fetchCities(client.districtId);
            this.formApi.setValue(`${fieldNamePrefix}judet`, client.districtId);
            this.setState({ countyLoaded: true });
            if (client.cityId) {
                await this.props.fetchStreets(client.cityId);
                this.formApi.setValue(`${fieldNamePrefix}localitate`, client.cityId);
                this.setState({ cityLoaded: true }, () => {
                    this.formApi.setValue(`${fieldNamePrefix}strada`, client.streetId);
                });
            }
        }
    }

    async handleValidateClick(type) {
        this.setState({ isValidationLoading: true });
        const form = { ...this.formApi.getState().values };
        await resetFormErrors(this);
        if (type === 'cnp') await this.validateCNP(this.props.contractType);
        else if (type === 'cui') {
            await this.validateCUI();
            await this.validateTipSocietate();
        }

        // this.formApi.reset();
        if (this.props.contractType === 'b2b')
            this.formApi.setValue('reprezentant_legal_cnp', form.reprezentant_legal_cnp);
        else this.formApi.setValue('client_cnp', form.client_cnp);
        // this.formApi.setValue('company_data_cui', form.company_data_cui);
        this.setState({ formSuccess: '' });

        if (noFormErrors(this)) {
            if (type === 'cnp') {
                if (this.props.contractType === 'b2b') {
                    await this.props.checkCNP(form.reprezentant_legal_cnp, type);
                } else {
                    await this.props.checkCNP(form.client_cnp, type);
                }
            } else if (type === 'cui') {
                await this.props.checkCNP(form.company_data_cui, type);
            }
            const { client } = this.props;

            if (type === 'cnp') {
                this.setState({
                    formSuccess: _.isEmpty(client)
                        ? 'CNP Valid - Client nou'
                        : 'CNP Valid - Client existent',
                });
            } else if (type === 'cui') {
                this.setState({
                    formSuccess: _.isEmpty(client)
                        ? 'CUI Valid - Client nou'
                        : 'CUI Valid - Client existent',
                });
            }

            if (this.props.contractType === 'b2b') {
                if (type === 'cui') {
                    this.formApi.setValues({
                        company_data_nume: client.nume_companie,
                        // company_data_cui: client.cnp_cui,
                        company_data_telefon_mobil: client.mobil || client.telefon,
                        company_data_email: client.email,
                        company_data_cod_onrc: client.cod_onrc,
                        company_data_cod_caen: client.cod_caen,
                        company_data_tip_companie: client.tip_companie,
                        company_address_tip_artera: client.streetTypeId,
                        company_address_nr_strada: client.streetNo,
                        company_address_bloc: client.building,
                        company_address_scara: client.entrance,
                        company_address_etaj: client.floor,
                        company_address_apartament: client.apartment,
                        company_address_cod_postal: '',
                    });
                    await this.fillAddressData(client, 'company_address_');
                } else if (type == 'cnp') {
                    this.formApi.setValues({
                        reprezentant_legal_prenume: client.name,
                        reprezentant_legal_nume: client.surname,
                        reprezentant_legal_email: client.email,
                        reprezentant_legal_telefon_mobil: client.mobil,
                        reprezentant_legal_rol: '',
                    });
                }
            } else {
                await this.fillAddressData(client, 'client_');

                const issueDate = this.formatIssueDate(client.idCardIssuedOn);

                this.formApi.setValues({
                    client_prenume: client.name,
                    client_nume: client.surname,
                    client_ci_serie: client.idCardSeries,
                    client_ci_numar: client.idCardNo,
                    client_ci_emis_de: client.idCardIssuedBy,
                    client_ci_emis_la: issueDate,
                    client_tip_artera: client.streetTypeId,
                    client_nr_strada: client.streetNo,
                    client_bloc: client.building,
                    client_scara: client.entrance,
                    client_etaj: client.floor,
                    client_apartament: client.apartment,
                    client_email: client.email,
                    client_telefon_mobil: client.mobil,
                    client_telefon_fix: client.telefon,
                });
            }
            this.formApi.setValues({
                contact_acord_protect: false,
                contact_acord_mkt_generali: false,
                contact_pers_publica_generali: false,
            });
            const phone = this.props.contractType === 'b2b' ? client.telefon : client.mobil;
            this.setState({
                contact_acord_mk: undefined,
                contact_acord_part: undefined,
                contact_acord_profil: undefined,
                contact_acord_protect: false,
                contact_acord_mkt_generali: false,
                contact_pers_publica_generali: false,
                contact_canal_email_text: client.email,
                contact_canal_telefon_text: phone,
                contact_canal_sms_text: phone,
            });
            this.setState({ isValidationLoading: false });
        } else {
            this.setState({ isValidationLoading: false });
        }
    }

    async handleCropSave() {
        setTimeout(async () => {
            const cropped = this.cropper.picture.getCroppedCanvas().toDataURL();
            this.uploadDocs([cropped]);
            this.handleCropCancel();
        }, 250);
    }

    handleCropCancel() {
        this.setState({ cropImage: null });
    }

    async handleDocSelect(file, docType) {
        if (!file) {
            return;
        }
        setTimeout(async () => {
            const images = await FileService.readImages(file);
            this.setState({ docType }, () => {
                this.uploadDocs([images[0]]);
            });
        }, 250);
    }

    async handleImageDelete(docIndex, imageIndex) {
        const { setDocLoading, unsetDocLoading } = this.props;
        const flow = this.getFlowType();
        let docs = { ...this.state.docs };
        docs[flow][docIndex].images.splice(imageIndex, 1);

        if (docs[flow][docIndex].images.length > 0) {
            this.setState({ docType: docIndex }, () => {
                this.uploadDocs(docs[flow][docIndex].images);
            });
        } else {
            setDocLoading(flow, docIndex);
            await this.props.deleteDoc(docIndex, flow.toUpperCase());
            unsetDocLoading(flow, docIndex);
        }
        this.setState({ docs }, () => {
            this.props.setDoc([...docs[flow][docIndex].images], docIndex, flow);
        });
    }

    async handleDocDelete(docType, flow) {
        const { deleteDoc, fetchDocs } = this.props;
        await deleteDoc(docType, flow);
        fetchDocs(flow, docType);
    }

    initDoc(docs, newDocType, images = []) {
        const flow = this.getFlowType();
        if (!docs[flow][newDocType]) {
            docs[flow][newDocType] = {
                title: TYPES[newDocType],
                images,
            };
            this.setState({ docs });
        }
    }

    handleDocTypeSelect(e) {
        const newDocType = e.target.value;
        if (newDocType) {
            let { docs } = this.state;
            this.setState({
                docType: newDocType,
            });
            this.initDoc(docs, newDocType, []);
        }
    }

    renderCropper() {
        if (this.state.cropImage) {
            return (
                <Cropper
                    ref={c => {
                        this.cropper = c;
                    }}
                    image={this.state.cropImage}
                    onSave={this.handleCropSave}
                    onCancel={this.handleCropCancel}
                    aspect="idCard"
                />
            );
        }
    }

    renderCard() {
        const { session } = this.props;
        if (this.canUploadDocs() && !this.state.cropImage) {
            return (
                <CardSelection
                    onSelect={({
                        target: {
                            files: [file],
                        },
                    }) => this.handleDocSelect(file, 'id')}
                    disabled={!session || !session.id}
                />
            );
        }
    }

    validateEmail = value => {
        if (value === undefined) {
            value = '';
        }
        if (this.state.canal_email) {
            return mix(email, requiredBefore(isLinkSent))(value);
        }
    };

    validateTelefon = value => {
        if (value === undefined) {
            value = '';
        }
        if (this.state.canal_telefon) {
            return mix(tel, requiredBefore(isLinkSent))(value);
        }
    };

    renderUploadDocs(index) {
        const { isDocLoading, shouldRenderPlaceDocs } = this.props;
        const flow = this.getFlowType();
        if (!flow) {
            return;
        }

        let { REGISTRATION_FISC_CERT, IMPUTERNICIRE_OR_DOC_CONSTITUIVE } = this.state.docs[flow];
        const { docType } = this.state;
        return (
            <div className="pod-display-wrapper">
                <DocList
                    docs={{ REGISTRATION_FISC_CERT }}
                    onDelete={(docIndex, imageIndex) =>
                        this.handleImageDelete(docIndex, imageIndex)
                    }
                    enableAdd
                    onAdd={(file, docType) => this.handleDocSelect(file, docType)}
                    loading={isDocLoading(flow, 'REGISTRATION_FISC_CERT')}
                    maxFileSize={megaBytesToBytes(10)}
                />
                <DocList
                    docs={{ IMPUTERNICIRE_OR_DOC_CONSTITUIVE }}
                    onDelete={(docIndex, imageIndex) =>
                        this.handleImageDelete(docIndex, imageIndex)
                    }
                    enableAdd
                    onAdd={(file, docType) => this.handleDocSelect(file, docType)}
                    loading={isDocLoading(flow, 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE')}
                    maxFileSize={megaBytesToBytes(10)}
                />

                {shouldRenderPlaceDocs && (
                    <CustomerDocsSelect
                        name="choice"
                        label="Documentele locului de consum"
                        placeholder="Alege"
                        value={
                            docType === 'REGISTRATION_FISC_CERT' ||
                            docType === 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE'
                                ? ''
                                : docType
                        }
                        className="form-control place-docs"
                        containerClass="mb-3 col-md-12"
                        validations={[]}
                        onSelect={e => this.handleDocTypeSelect(e, index)}
                        items={this.getDocOptions(index)}
                        upperCase
                    />
                )}
            </div>
        );
    }

    resetChannelCheckBoxes() {
        if (
            !this.state.contact_acord_mk &&
            !this.state.contact_acord_part &&
            !this.state.contact_acord_profil
        ) {
            this.formApi.setValue('contact_canal_email_text', '');
            this.formApi.setValue('contact_canal_sms_text', '');
            this.formApi.setValue('contact_canal_telefon_text', '');
            this.formApi.setValue('contact_canal_posta', false);
            this.setState({
                contact_canal_email: false,
                contact_canal_sms: false,
                contact_canal_telefon: false,
                contact_canal_posta: false,
            });
        }
    }

    handleMarketingAgreeCheckBox() {
        this.setState(
            {
                contact_acord_mk:
                    this.state.contact_acord_mk === undefined ||
                    this.state.contact_acord_mk === false
                        ? true
                        : undefined,
            },
            this.resetChannelCheckBoxes
        );
    }

    handleMarketingDisagreeCheckBox() {
        this.setState(
            {
                contact_acord_mk:
                    this.state.contact_acord_mk === undefined ||
                    this.state.contact_acord_mk === true
                        ? false
                        : undefined,
            },
            this.resetChannelCheckBoxes
        );
    }

    handleMarketingContactDataAgreeCheckBox() {
        this.setState(
            {
                contact_acord_part:
                    this.state.contact_acord_part === undefined ||
                    this.state.contact_acord_part === false
                        ? true
                        : undefined,
            },
            this.resetChannelCheckBoxes
        );
    }

    handleMarketingContactDataDisagreeCheckBox() {
        this.setState(
            {
                contact_acord_part:
                    this.state.contact_acord_part === undefined ||
                    this.state.contact_acord_part === true
                        ? false
                        : undefined,
            },
            this.resetChannelCheckBoxes
        );
    }

    handleMarketingProfileaAgreeCheckBox() {
        this.setState(
            {
                contact_acord_profil:
                    this.state.contact_acord_profil === undefined ||
                    this.state.contact_acord_profil === false
                        ? true
                        : undefined,
            },
            this.resetChannelCheckBoxes
        );
    }

    handleMarketingProfileDisagreeCheckBox() {
        this.setState(
            {
                contact_acord_profil:
                    this.state.contact_acord_profil === undefined ||
                    this.state.contact_acord_profil === true
                        ? false
                        : undefined,
            },
            this.resetChannelCheckBoxes
        );
    }

    handleChannelCheckBox(e) {
        const newValue = !this.state[e.target.name];
        this.setState({ [e.target.name]: newValue });
        const isChecked = newValue;

        const { contractType } = this.props;
        const formState = this.formApi.getState();
        if (e.target.name === 'contact_canal_email') {
            this.formApi.setValue(
                'contact_canal_email_text',
                isChecked
                    ? contractType === 'b2b'
                        ? formState.values.company_data_email
                        : formState.values.client_email
                    : ''
            );
        }
        if (e.target.name === 'contact_canal_sms') {
            this.formApi.setValue(
                'contact_canal_sms_text',
                isChecked
                    ? contractType === 'b2b'
                        ? formState.values.company_data_telefon_mobil
                        : formState.values.client_telefon_mobil
                    : ''
            );
        }
        if (e.target.name === 'contact_canal_telefon') {
            this.formApi.setValue(
                'contact_canal_telefon_text',
                isChecked
                    ? contractType === 'b2b'
                        ? formState.values.company_data_telefon_mobil
                        : formState.values.client_telefon_mobil
                    : ''
            );
        }
    }

    render() {
        const {
            step,
            isCurrent,
            isLinkSent,
            isContractSent,
            show,
            session,
            discounts,
            docs,
            getApi = f => f,
        } = this.props;

        return (
            <Section
                title="Informatii Client"
                step={step}
                isCurrent={isCurrent}
                show={show}
                className="ClientInfoSection"
            >
                <Form
                    autoComplete="off"
                    getApi={formApi => {
                        getApi(formApi);
                        this.setFormApi(formApi);
                    }}
                >
                    <div className="row">
                        <div className="col-md-6 col-left">
                            {this.props.contractType === 'b2b' && (
                                <CompanyIdentification
                                    formSuccess={this.state.formSuccess}
                                    formErrors={this.state.formErrors}
                                    onValidateClick={this.handleValidateClick}
                                />
                            )}
                            <ClientIdentification
                                isLinkSent={isLinkSent}
                                isLoading={this.state.isValidationLoading}
                                formSuccess={this.state.formSuccess}
                                formErrors={this.state.formErrors}
                                onValidateClick={this.handleValidateClick}
                                contractType={this.props.contractType}
                            />
                            <ContactData
                                isLinkSent={isLinkSent}
                                formErrors={this.state.formErrors}
                                contractType={this.props.contractType}
                            />
                        </div>
                        <div className="col-md-6">
                            {/*{*/}
                            <Document
                                idImage={this.props.idImage}
                                docSelection={this.state.docSelection}
                                onDelete={this.handleDelete}
                            />
                            {this.renderCard()}
                            {/*}*/}
                            {this.props.contractType === 'b2b' && (
                                <Fragment>
                                    {this.canUploadDocs() && this.renderUploadDocs(0)}
                                    {!this.canUploadDocs() && (
                                        <Documents
                                            flow={this.getFlowType()}
                                            docs={docs[this.getFlowType()]}
                                            options={docs}
                                            onDelete={this.handleDocDelete}
                                            isB2B={true}
                                        />
                                    )}
                                </Fragment>
                            )}
                            {this.renderCropper()}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-left">
                            <div className="group-name">TRANSMITERE CONTRACT</div>
                            <FormErrors errors={this.state.formErrors['contract']} />
                            <div className="row">
                                <Radio
                                    className="col-md-3 contact-info-radio"
                                    name="canal"
                                    options={[
                                        {
                                            value: 'email',
                                            label: 'E-mail',
                                        },
                                        {
                                            value: 'telefon',
                                            label: 'Telefon',
                                        },
                                    ]}
                                    onChange={this.handleChannelSelection}
                                    validate={requiredBefore(isLinkSent)}
                                    // disabled={isLinkSent}
                                />
                                <div className="col-md-8">
                                    <Text
                                        className="linked-input"
                                        label="E-mail"
                                        name="contact_email"
                                        validate={this.validateEmail}
                                        // highlight={!isLinkSent}
                                        // disabled={isLinkSent || this.state.canal_telefon}
                                        disabled={this.state.canal_telefon}
                                    />
                                    <Text
                                        className="linked-input"
                                        label="Telefon"
                                        name="contact_telefon"
                                        validate={this.validateTelefon}
                                        // highlight={!isLinkSent}
                                        disabled={this.state.canal_email}
                                        // disabled={isLinkSent || this.state.canal_email}
                                    />
                                </div>
                                {/* {
                                    <ChannelInput
                                        isLinkSent={isLinkSent}
                                        options={{
                                            emailChannel: this.state.canal_email,
                                            phoneChannel: this.state.canal_telefon,
                                        }}
                                    />
                                } */}
                            </div>
                            <Discounts
                                discounts={discounts}
                                sessionDiscountIds={
                                    //session.ee_contact ? session.ee_contact.discounts : []
                                    session[`${this.getFlowType()}_contact`]
                                        ? session[`${this.getFlowType()}_contact`].discounts
                                        : []
                                }
                                readOnly={isLinkSent}
                            />
                            <InsuranceOptions
                                isContractSent={isContractSent}
                                isPlanSelected={isPlanSelected}
                                session={this.props.session}
                                insuranceErrorModal={this.insuranceErrorModal}
                            />
                            <MarketingPurposesCommunication
                                isLinkSent={isLinkSent}
                                formErrors={this.state.formErrors}
                                handleMarketingAgreeCheckBox={this.handleMarketingAgreeCheckBox}
                                handleMarketingDisagreeCheckBox={
                                    this.handleMarketingDisagreeCheckBox
                                }
                                handleMarketingContactDataAgreeCheckBox={
                                    this.handleMarketingContactDataAgreeCheckBox
                                }
                                handleMarketingContactDataDisagreeCheckBox={
                                    this.handleMarketingContactDataDisagreeCheckBox
                                }
                                handleMarketingProfileaAgreeCheckBox={
                                    this.handleMarketingProfileaAgreeCheckBox
                                }
                                handleMarketingProfileDisagreeCheckBox={
                                    this.handleMarketingProfileDisagreeCheckBox
                                }
                                contact_acord_mk={this.state.contact_acord_mk}
                                contact_acord_part={this.state.contact_acord_part}
                                contact_acord_profil={this.state.contact_acord_profil}
                                handle
                            />
                            <MarketingOptions
                                isLinkSent={isLinkSent}
                                onChannelCheckbox={this.handleChannelCheckBox}
                                onAddressCheckbox={this.handleAddressCheckbox}
                                atLeastOneMarketingChannelAccepted={
                                    this.state.contact_acord_mk ||
                                    this.state.contact_acord_part ||
                                    this.state.contact_acord_profil
                                }
                                options={{
                                    emailChannel: this.state.contact_canal_email,
                                    smsChannel: this.state.contact_canal_sms,
                                    phoneChannel: this.state.contact_canal_telefon,
                                }}
                            />
                            {/* <MarketingAddress
                                onCountyChange={this.handleCountyChange}
                                onCityChange={this.handleCityChange}
                                formApi={this.formApi}
                                isLinkSent={isLinkSent}
                                counties={this.props.counties}
                                cities={this.props.cities}
                                streets={this.props.streets}
                                streetTypes={this.props.streetTypes}
                                options={{
                                    postalChannel: this.state.contact_canal_posta,
                                }}
                            /> */}
                        </div>
                        <div className="col-md-6 col-right">
                            {this.props.contractType !== 'b2b' && (
                                <IdentityData
                                    isLinkSent={isLinkSent}
                                    isContractSent={isContractSent}
                                    isFastFlux={isFastFlux}
                                />
                            )}
                            <ClientAddress
                                onCountyChange={this.handleCountyChange}
                                onCityChange={this.handleCityChange}
                                isLinkSent={isLinkSent}
                                isContractSent={isContractSent}
                                formApi={this.formApi}
                                counties={this.props.counties}
                                cities={this.props.cities}
                                streets={this.props.streets}
                                streetTypes={this.props.streetTypes}
                                contractType={this.props.contractType}
                            />
                        </div>
                    </div>
                    {!isContractSent && (
                        <div className="spaced-top">
                            <Button
                                outlined
                                value={session.id ? 'Continua' : 'Creeaza sesiune noua'}
                                onClick={this.handleNextClick}
                            />
                        </div>
                    )}
                </Form>
            </Section>
        );
    }
}

const mapStateToProps = state => ({
    counties: countiesSelectors.getItems(state),
    contractType: getContractType(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    client: getClient(state),
    streets: getStreets(state),
    session: getSession(state),
    idImage: getID(state),
    registrationFisc: getRegistrationFisc(state),
    powerOfAttorneyOrReg: getPowerOfAttorneyOrReg(state),
    powerOfAttorney: getPowerOfAttorney(state),
    docConstituive: getDocConstituive(state),
    campaigns: getCampaigns(state),
    discounts: getDiscounts(state),
    isLinkSent: isLinkSent(state),
    hasClientSignedAgreement: hasClientSignedAgreement(state),
    isFastFlux: isFastFlux(state),
    docs: getDocs(state),
    isDocLoading: isDocLoading(state),
    isContractSent: isContractSent(state),
    isPlanSelected: isPlanSelected(state),
    timestamps: getTimestamps(state),
    authUser: getAuthUser(state),
});

const mapDispatchToProps = {
    createSession,
    patchSession,
    fetchDocs,
    fetchDistributors,
    fetchCounties,
    fetchCities,
    fetchStreetTypes,
    fetchStreets,
    fetchID,
    deleteDoc,
    checkCNP,
    setDoc,
    uploadID,
    uploadRegistrationFisc,
    uploadPowerOfAttorneyOrReg,
    fetchDiscounts,
    setDocLoading,
    unsetDocLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientInfoSection);
