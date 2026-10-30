import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import _ from 'lodash';

import { getItems as getProviders } from 'store/providers/selectors';
import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getSession, isContractSent } from 'store/session/selectors';
import { getItems as getBanks } from 'store/banks/selectors';
import { getNLC, isLinkSent } from 'store/client/selectors';

import { email, mix, requiredBefore, tel } from 'services/rules';

import InvoiceDistributionMode from './components/InvoiceDistributionMode';
import Bank from './components/Bank';

import { checkEmail, prevalidateEmailCfe } from 'store/client/actions';
import { patch as patchSession } from 'store/session/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { fetchAllItems as fetchBanks } from 'store/banks/actions';

import pageService from 'services/page';
import offerService from 'services/offer';
import { checkForm, getFromForm, noFormErrors, resetFormErrors } from 'services/form';

import { Form, Select, Text } from 'components/form';
import Section from 'components/Section';
import { Button } from 'components/Button';

class ContractOptionsSection extends Component {
    static propTypes = {
        onNextClick: PropTypes.func.isRequired,
    };

    formErrors = {
        invoice: [],
    };

    state = {
        isValid: true,
        showEmail: false,
        showPhoneNumber: false,
        showBank: false,
        address: 'new',
        cityLoaded: false,
        dataLoaded: false,
        hasCFE: false,
        formErrors: this.formErrors,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.onMount(this);
        this.props.fetchStreetTypes();
        this.props.fetchBanks();
    }

    async componentDidUpdate(prevProps) {
        const { session, isEdit } = this.props;
        if (isEdit) {
            if (!_.isEmpty(session) && this.formApi && !this.state.dataLoaded) {
                this.setState({ dataLoaded: true });
                await this.loadSessionInvoice();
                this.setValues();
            }
        } else {
            if (this.formApi && !this.state.dataLoaded) {
                this.setState({ dataLoaded: true });
                this.setValues();
            }
        }

        this.checkFCE();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    async loadSessionInvoice() {
        const invoice = this.props.session.ee_factura;
        const data = _.transform(invoice, (result, value, key) => {
            result[`factura_${key}`] = value;
        });

        data.factura_mod_corespondenta = invoice.mod_corespondenta === 'MAIL';

        if (this.props.session.contract_type === 'b2b') {
            if (data.factura_mod_corespondenta) {
                await this.handleEmailCheckbox({ target: { checked: true } });
            }
        } else {
            if (invoice.mod_corespondenta === 'MAIL') {
                this.formApi.setValue('factura_mod_corespondenta1', 'MAIL');
                await this.onEbillTypeSelected({ target: { checked: true, value: 'MAIL' } });
            }
            if (invoice.mod_corespondenta === 'SMS') {
                this.formApi.setValue('factura_mod_corespondenta1', 'SMS');
                await this.onEbillTypeSelected({ target: { checked: true, value: 'SMS' } });
            }
        }

        // if (data.factura_mod_corespondenta) {
        //     await this.handleEmailCheckbox({ target: { checked: true } });
        // }
        if (data.factura_avans === 'BANCA') {
            await this.handlePrepayChange({ target: { value: 'BANCA' } });
        }

        if (invoice.judet) {
            await this.props.fetchCities(invoice.judet);
            this.formApi.setValue('factura_judet', invoice.judet);
            this.setState({ countyLoaded: true });
            if (invoice.localitate) {
                await this.props.fetchStreets(invoice.localitate);
                this.formApi.setValue('factura_localitate', invoice.localitate);
                this.setState({ cityLoaded: true }, () => {
                    this.formApi.setValue('factura_strada', invoice.strada);
                });
            }
        }

        this.formApi.setValues(data);
    }

    async checkFCE() {
        if (this.formApi && this.hasCFE() !== this.state.hasCFE) {
            this.setState({ hasCFE: this.hasCFE() });
            if (this.hasCFE()) {
                this.formApi.setValue('factura_mod_corespondenta', true);
                await this.handleEmailCheckbox({ target: { checked: true } });
                await this.patchInvoice();
            }
        }
    }

    getRythm(flow) {
        const { counties, session } = this.props;
        const county = _.find(counties, item => item.denumire === session.judet);
        const isEnelCounty =
            !_.isNil(county) &&
            !_.isNil(county.distribution) &&
            !_.isNil(county.distribution.distributie_enel) &&
            county.distribution.distributie_enel === 'D';
        const currentProvider = _.find(
            this.props[`${flow}Providers`],
            item => item.internal_id === session[`${flow}_furnizor_actual`]
        );

        return offerService.getRythm({
            flow,
            isEnelCounty,
            currentProvider,
            county,
        });
    }

    async setValues() {
        const { session } = this.props;
        const { values } = this.formApi.getState();
        if (!values.factura_avans) {
            this.setState({ loadingPrepay: true }, async () => {
                this.formApi.setValue('factura_avans', 'FACTURA');
                await this.handlePrepayChange({ target: { value: 'FACTURA' } });
            });
        }

        if (!values.factura_judet) {
            const place = _.isEmpty(session.gaz_loc) ? 'ee_loc' : 'gaz_loc';
            this.formApi.setValue('address', place);
            this.handleAddressChange({
                target: {
                    value: _.isEmpty(session.gaz_loc) ? 'ee_loc' : 'gaz_loc',
                },
            });
        }
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    isValid() {
        return this.state.isValid && noFormErrors(this);
    }

    prefixObject(data, prefix) {
        return _.transform(data, (result, value, key) => {
            result[prefix + key] = value;
        });
    }

    async validate() {
        await resetFormErrors(this);
        await checkForm(this);
        // NO BLACKLIST check on Telesales
        //await this.checkBlacklist();
        await this.prevalidateEmailCfe();
    }

    async prevalidateEmailCfe() {
        await prevalidateEmailCfe(this, 'factura_email', 'invoice');
    }

    async checkBlacklist() {
        await checkEmail(this, 'factura_email', 'invoice');
    }

    //NO blacklist check required on Telesales
    // async checkBlacklist() {
    //     await checkEmail(this, 'factura_email', 'invoice');
    // }

    hasCFE() {
        const { session } = this.props;
        if (session) {
            const { ee_serviciu, gaz_serviciu } = session;
            return !!((ee_serviciu && ee_serviciu.cfe) || (gaz_serviciu && gaz_serviciu.cfe));
        }

        return false;
    }

    isPLMarketContract() {
        const { session, nlc } = this.props;
        const changeOwner = session[`${this.props.flow}_schimba_titular`];
        const changeProvider = session[`${this.props.flow}_schimba_furnizor`];
        const isActiveSupply = nlc && nlc.status && nlc.status === 'ACTIV';
        const isPL = nlc && nlc.piata && nlc.piata === 'PL';

        return !changeOwner && !changeProvider && isActiveSupply && isPL;
    }

    async patchInvoice() {
        const factura = getFromForm(this.formApi, 'factura_');
        if (this.props.session.contract_type === 'b2b') {
            factura.mod_corespondenta = factura.mod_corespondenta ? 'MAIL' : 'POSTA';
        } else {
            factura.mod_corespondenta = factura.mod_corespondenta1
                ? factura.mod_corespondenta1
                : 'POSTA';
        }

        factura.email = factura.email || '';
        factura['telefon_mobil'] = factura.telefon_mobil || '';

        await this.props.patchSession({
            _factura: factura,
        });
    }

    async onEbillTypeSelected(e) {
        if (e.target.value === 'MAIL') {
            this.setState({ showEmail: true });
            this.setState({ showPhoneNumber: false });
        } else if (e.target.value === 'SMS') {
            this.setState({ showEmail: false });
            this.setState({ showPhoneNumber: true });
        }
    }

    async handleCountyChange(e) {
        this.formApi.setValues({
            factura_judet: e.target.value,
            factura_localitate: '',
            factura_strada: '',
        });
        await this.props.fetchCities(e.target.value);
    }

    async handleCityChange(e) {
        await this.props.fetchStreets(e.target.value);
        this.formApi.setValues({ factura_strada: '' });
    }

    handleAddressChange(e) {
        let newAddress = offerService.getAddressBySelect(null, 'new');
        newAddress = this.prefixObject(newAddress, 'factura_');
        this.formApi.setValues(newAddress);

        this.setState({ address: e.target.value }, async () => {
            const addressData = offerService.getAddressBySelect(
                this.props.session,
                this.state.address
            );

            if (this.state.address !== 'new') {
                if (addressData.judet) {
                    await this.props.fetchCities(addressData.judet);
                    this.formApi.setValue('factura_judet', addressData.judet);
                    this.setState({ countyLoaded: true });
                    if (addressData.localitate) {
                        await this.props.fetchStreets(addressData.localitate);
                        this.formApi.setValue('factura_localitate', addressData.localitate);
                        this.setState({ cityLoaded: true }, () => {
                            this.formApi.setValue('factura_strada', addressData.strada);
                        });
                    }
                }
            }

            const invoiceAddressData = this.prefixObject(addressData, 'factura_');
            this.formApi.setValues(invoiceAddressData);
        });
    }

    handlePrepayChange(e) {
        return new Promise(resolve => {
            if (e.target.value !== 'BANCA') {
                this.formApi.setValues({
                    iban: '',
                    banca: '',
                });
                this.setState({ showBank: false }, resolve);
            } else {
                this.setState({ showBank: true }, resolve);
            }
        });
    }

    async handleNextClick(e) {
        await this.validate();
        if (this.isValid()) {
            const { session, isLinkSent } = this.props;
            await this.patchInvoice();

            if (isLinkSent) {
                if (session.type === 'COMBO') {
                    await this.props.patchSession({
                        ee_factura: {
                            cu_avans: true,
                            ritm: this.getRythm('ee'),
                        },
                        gaz_factura: {
                            cu_avans: false,
                            ritm: this.getRythm('gaz'),
                        },
                    });
                } else {
                    const flow = session.type.toLowerCase();
                    await this.props.patchSession({
                        [`${flow}_factura`]: {
                            cu_avans: flow === 'ee',
                            ritm: this.getRythm(flow),
                        },
                        // TODO: move eneltel to PODs info
                        // [`${flow}_loc`]: {
                        //     eneltel: factura.avans === 'FACTURA' ? null : nlc.eneltelCode || '',
                        // },
                    });
                }
            }

            if (e) this.props.onNextClick();
        } else {
            if (e) pageService.scrollToError();
        }
    }

    renderEmailInput() {
        if (this.state.showEmail) {
            const { isLinkSent, session } = this.props;
            return (
                <div className="row">
                    <Text
                        className="col-md-12 "
                        label="E-mail"
                        name="factura_email"
                        validate={mix(requiredBefore(isLinkSent), email)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        initialValue={
                            session.contract_type === 'b2b'
                                ? session.company.data.email
                                : session.client.email
                        }
                    />
                </div>
            );
        }
    }

    renderPhoneNumberInput() {
        if (this.state.showPhoneNumber) {
            const { isLinkSent, session } = this.props;
            return (
                <div className="row">
                    <Text
                        className="col-md-12 "
                        label="Telefon"
                        name="factura_telefon_mobil"
                        validate={mix(requiredBefore(isLinkSent), tel)}
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        initialValue={
                            session.contract_type === 'b2b'
                                ? session.company.data.telefon_mobil
                                : session.client.telefon_mobil
                        }
                    />
                </div>
            );
        }
    }
    async handleEmailCheckbox(e) {
        if (e.target.checked) {
            this.setState({ showEmail: true });
        } else {
            this.setState({ showEmail: false });
        }
    }

    render() {
        const { step, isCurrent, isLinkSent, isContractSent, show, session } = this.props;
        const addresses = [
            {
                value: _.isEmpty(session.gaz_loc) ? 'ee_loc' : 'gaz_loc',
                label: 'Aceeași cu cea de consum',
            },
            {
                value: 'client',
                label: 'Aceeași cu cea de domiciliu',
            },
            {
                value: 'new',
                label: 'Altă adresă (completează)',
            },
        ];
        const prepayments = [
            {
                value: 'FACTURA',
                label: 'Compensare pe facturi',
            },
            {
                value: 'BANCA',
                label: 'Transfer bancar',
            },
            {
                value: 'POSTA',
                label: 'Mandat poștal',
            },
        ];

        return (
            <Section
                title="Opțiuni Contractuale"
                step={step}
                isCurrent={isCurrent}
                show={show}
                className="ContractOptionsSection"
            >
                <Form autoComplete="off" getApi={this.setFormApi}>
                    <div className="row">
                        <div className="col-md-6 col-left">
                            <InvoiceDistributionMode
                                onCountyChange={this.handleCountyChange}
                                onAddressChange={this.handleAddressChange}
                                onCityChange={this.handleCityChange}
                                onEbillTypeSelected={this.onEbillTypeSelected}
                                isLinkSent={isLinkSent}
                                isPLMarketContract={this.isPLMarketContract()}
                                onEmailCheckbox={this.handleEmailCheckbox}
                                formApi={this.formApi}
                                addresses={addresses}
                                counties={this.props.counties}
                                cities={this.props.cities}
                                streets={this.props.streets}
                                session={this.props.session}
                                streetTypes={this.props.streetTypes}
                                hasCFE={this.hasCFE()}
                                formErrors={this.state.formErrors}
                            />
                            {this.renderEmailInput()}
                            {this.renderPhoneNumberInput()}
                        </div>
                        <div className="col-md-6 col-right">
                            <div className="group-name">ALTE OPȚIUNI</div>
                            <div className="row">
                                <Select
                                    className="col-md-12"
                                    label="Compensare sume în avans"
                                    name="factura_avans"
                                    options={prepayments}
                                    onChange={this.handlePrepayChange}
                                    validate={requiredBefore(isLinkSent)}
                                    highlight={!isLinkSent}
                                    disabled
                                />
                            </div>
                            <Bank
                                show={this.state.showBank}
                                banks={this.props.banks}
                                formApi={this.formApi}
                                isLinkSent={this.isLinkSent}
                            />
                        </div>
                    </div>
                    {!isContractSent && (
                        <div className="spaced-top">
                            <Button outlined value="Continua" onClick={this.handleNextClick} />
                        </div>
                    )}
                </Form>
            </Section>
        );
    }
}

const mapStateToProps = state => ({
    counties: getCounties(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    streets: getStreets(state),
    session: getSession(state),
    banks: getBanks(state),
    nlc: getNLC(state),
    eeProviders: getProviders(state, 'ee'),
    gazProviders: getProviders(state, 'gaz'),
    isLinkSent: isLinkSent(state),
    isContractSent: isContractSent(state),
});

const mapDispatchToProps = {
    patchSession,
    fetchCities,
    fetchStreetTypes,
    fetchStreets,
    fetchBanks,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContractOptionsSection);
