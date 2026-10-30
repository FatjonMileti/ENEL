import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import moment from 'moment';
import _ from 'lodash';

import MarketingPurposesCommunication from './components/MarketingPurposesCommunication';
import MarketingOptions from './components/MarketingOptions';
import MarketingAddress from './components/MarketingAddress';
import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';
import { Checkbox } from 'components/form';

import * as countiesSelectors from 'store/counties/selectors';
import { getItems as getStreetTypes } from 'store/streetTypes/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';

import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';

import { LEAD_STATUS, STATUS_LABELS, SUBSTATUS_MAPPING, SUBSTATUS_LABELS } from 'services/lead';
import { ROLES } from 'services/user';
import { getFromForm } from 'services/form';

import './BulkEditModal.scss';
import { Form, Text, TextArea, Select } from 'components/form';

const initialState = {
    status: null,
    getMarketingOptions: false,
    contact_acord_mk: false,
    contact_acord_part: false,
    contact_acord_profil: false,
    contact_canal_email: false,
    contact_canal_sms: false,
    contact_canal_telefon: false,
    contact_canal_posta: false,
    formErrors: {
        channel: [],
    },
};

class BulkEditModal extends Component {
    state = { ...initialState };

    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchStreetTypes();
    }

    resetState() {
        this.setState(initialState);
    }

    getStatusLabel(status) {
        return STATUS_LABELS[status] || status;
    }

    getStatusOptions() {
        return _.map(LEAD_STATUS, status => ({ value: status, label: STATUS_LABELS[status] }));
    }

    getSubstatusOptions() {
        const { status } = this.state;

        if (status && SUBSTATUS_MAPPING[status]) {
            return _.map(SUBSTATUS_MAPPING[status], substatus => ({
                value: substatus,
                label: SUBSTATUS_LABELS[substatus],
            }));
        }

        return [];
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
    }

    handleStateCheckbox(e) {
        return new Promise(resolve => {
            this.setState(
                {
                    [e.target.name]: e.target.checked,
                },
                () => {
                    if (
                        !this.state.contact_acord_mk &&
                        !this.state.contact_acord_part &&
                        !this.state.contact_acord_profil
                    ) {
                        this.setState(
                            {
                                contact_canal_email: false,
                                contact_canal_sms: false,
                                contact_canal_telefon: false,
                                contact_canal_posta: false,
                            },
                            resolve
                        );
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    handleChannelCheckbox(e, ...inputs) {
        const { values } = this.formApi.getState();
        const name = `${e.target.name}_text`;
        if (e.target.checked) {
            this.handleStateCheckbox(e);
            setTimeout(() => {
                this.formApi.setValue(name, values[inputs[0]] || values[inputs[1]]);
            }, 250);
        } else {
            this.handleStateCheckbox(e);
        }
    }

    handleAddressCheckbox(e) {
        if (e.target.checked) {
            this.handleStateCheckbox(e);
            setTimeout(async () => {
                const { values } = this.formApi.getState();
                if (values.client_judet) {
                    await this.props.fetchCities(values.client_judet);
                    this.formApi.setValue('canal_posta_judet', values.client_judet);
                    this.setState({ countyLoaded: true });
                    if (values.client_localitate) {
                        await this.props.fetchStreets(values.client_localitate);
                        this.formApi.setValue('canal_posta_localitate', values.client_localitate);
                        this.setState({ cityLoaded: true }, () => {
                            this.formApi.setValue('canal_posta_strada', values.client_strada);
                        });
                    }
                }

                this.formApi.setValues({
                    canal_posta_tip_artera: values.client_tip_artera,
                    canal_posta_nr_strada: values.client_nr_strada,
                    canal_posta_bloc: values.client_bloc,
                    canal_posta_scara: values.client_scara,
                    canal_posta_etaj: values.client_etaj,
                    canal_posta_apartament: values.client_apartament,
                    canal_posta_cod_postal: values.client_cod_postal,
                });
            }, 250);
        } else {
            this.handleStateCheckbox(e);
        }
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

    handleShow() {
        const { onShow } = this.props;
        disableBodyScroll(this.modal.current);
        if (onShow) {
            onShow();
        }
    }

    handleHide() {
        const { onHide } = this.props;
        this.resetState();
        enableBodyScroll(this.modal.current);
        if (onHide) {
            onHide();
        }
    }

    handleConfirmClick(e) {
        e.preventDefault();
        const { authUser } = this.props;
        let values = {};

        if (authUser && authUser.role === ROLES.BUM) {
            values = {
                note: this.formApi.getValue('note'),
            };
        } else {
            const lead = getFromForm(this.formApi, 'lead_');
            const contact = getFromForm(this.formApi, 'contact_');

            if (lead.expiry_date) {
                lead.expiry_date = moment(lead.expiry_date, 'DD.MM.YYYY').format('YYYY-MM-DD');
            }

            values = { ...lead };

            if (this.state.getMarketingOptions) {
                values['contact'] = {
                    acord_mk: contact.acord_mk || false,
                    acord_part: contact.acord_part || false,
                    acord_profil: contact.acord_profil || false,
                    canal_email: contact.canal_email || false,
                    canal_email_text: contact.canal_email_text || '',
                    canal_posta: contact.canal_posta || false,
                    canal_posta_adresa: getFromForm(this.formApi, 'canal_posta_'),
                    canal_sms: contact.canal_sms || false,
                    canal_sms_text: contact.canal_sms_text || '',
                    canal_telefon: contact.canal_telefon || false,
                    canal_telefon_text: contact.canal_telefon_text || '',
                };
            }
        }

        this.hide();
        if (this.props.onConfirm) {
            this.props.onConfirm(e, values);
        }
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    handleStatusChange(e) {
        this.setState({ status: e.target.value });
    }

    handleGetMarketingOptions(e) {
        this.setState({ getMarketingOptions: e.target.checked });
    }

    renderNoteForm() {
        return (
            <Form autoComplete="off" getApi={this.setFormApi}>
                <div className="row">
                    <TextArea className="offset-md-2 col-md-8" label="Notițā" name="note" />
                </div>
            </Form>
        );
    }

    renderDetailedForm() {
        return (
            <Form autoComplete="off" getApi={this.setFormApi}>
                <div className="row">
                    <Select
                        className="col-md-6"
                        label="Status"
                        name="lead_status"
                        options={this.getStatusOptions()}
                        onChange={this.handleStatusChange}
                    />
                    <Select
                        className="col-md-6"
                        label="Substatus"
                        name="lead_substatus"
                        options={this.getSubstatusOptions()}
                    />
                </div>
                <div className="row">
                    <Select
                        className="col-md-6"
                        label="Tip Piata"
                        name="lead_market"
                        options={[
                            { value: 'PL', label: 'Piata Libera' },
                            { value: 'PR', label: 'Piata Reglementata' },
                        ]}
                    />
                    <Text className="col-md-6" label="Sursa" name="source" />
                </div>
                <div className="row">
                    <Text
                        className="col-md-6"
                        label="Data de Expirare"
                        name="lead_expiry_date"
                        type="date"
                    />
                </div>
                <div className="row">
                    <div className="col-md-6 col-left">
                        <div className="row">
                            <Checkbox
                                className="col-md-12"
                                name="get_marketing_options"
                                label="Preia optiuni de marketing"
                                onChange={this.handleGetMarketingOptions}
                            />
                        </div>
                        {this.state.getMarketingOptions && (
                            <Fragment>
                                <MarketingPurposesCommunication
                                    formErrors={this.state.formErrors}
                                    onStateCheckbox={this.handleStateCheckbox}
                                />
                                <MarketingOptions
                                    onChannelCheckbox={this.handleChannelCheckbox}
                                    onStateCheckbox={this.handleStateCheckbox}
                                    onAddressCheckbox={this.handleAddressCheckbox}
                                    options={{
                                        agreementMk: this.state.contact_acord_mk,
                                        agreementPart: this.state.contact_acord_part,
                                        emailChannel: this.state.contact_canal_email,
                                        smsChannel: this.state.contact_canal_sms,
                                        phoneChannel: this.state.contact_canal_telefon,
                                    }}
                                />
                                <MarketingAddress
                                    onCountyChange={this.handleCountyChange}
                                    onCityChange={this.handleCityChange}
                                    formApi={this.formApi}
                                    counties={this.props.counties}
                                    cities={this.props.cities}
                                    streets={this.props.streets}
                                    streetTypes={this.props.streetTypes}
                                    options={{
                                        postalChannel: this.state.contact_canal_posta,
                                    }}
                                />
                            </Fragment>
                        )}
                    </div>
                </div>
            </Form>
        );
    }

    renderForm() {
        const { authUser } = this.props;
        if (authUser && authUser.role === ROLES.BUM) {
            return this.renderNoteForm();
        }
        return this.renderDetailedForm();
    }

    render() {
        return (
            <DropModal
                className="BulkEditModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Editeazā campuri</div>
                    <div className="data-panel">{this.renderForm()}</div>
                    <Button primary value="Salveazā" onClick={this.handleConfirmClick} />
                    <Button primary underline value="Anuleazā" onClick={this.handleDismissClick} />
                </div>
            </DropModal>
        );
    }
}

const mapStateToProps = state => ({
    counties: countiesSelectors.getItems(state),
    streetTypes: getStreetTypes(state),
    cities: getCities(state),
    streets: getStreets(state),
    authUser: getAuthUser(state),
});

const mapDispatchToProps = {
    fetchCounties,
    fetchCities,
    fetchStreetTypes,
    fetchStreets,
};

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(BulkEditModal);
