import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';

import MarketingPurposesCommunication from './components/MarketingPurposesCommunication';
import MarketingOptions from './components/MarketingOptions';
import MarketingAddress from './components/MarketingAddress';

import {
    fetchItems as fetchLeads,
    countEditItems as countEditLeads,
    fetchItem as fetchLead,
    clearSelection as clearLeadsSelection,
    bulkPatch,
    clearList as clearLeadsList,
    patch as patchLead,
} from 'store/leads/actions';
import { fetchAllItems as fetchLeadLogs } from 'store/leadLogs/actions';
import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';

import { getUser as getAuthUser } from 'store/auth/selectors';
import { getItemById as getLeadById } from 'store/leads/selectors';
import { getItemsByLeadId as getLeadLogs } from 'store/leadLogs/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import { getItems as getCounties } from 'store/counties/selectors';

import createSession from 'services/createSession';

import MainLayout from 'layouts/MainLayout';
import Section from 'components/Section';
import { Button } from 'components/Button';
import CallModal from '../LeadsList/components/CallModal';

import { Text, Form } from 'components/form';

import { STATUS_LABELS, SUBSTATUS_LABELS } from 'services/lead';
import { ROLES } from 'services/user';

import './LeadDetails.scss';

const TABS = {
    DETAILS: 'DETAILS',
    NOTES: 'NOTES',
    LOGS: 'LOGS',
};

const initialState = {
    status: null,
    getMarketingOptions: false,
    contact_acord_mk: false,
    contact_acord_part: false,
    acord_profil: false,
    contact_canal_email: false,
    contact_canal_sms: false,
    contact_canal_telefon: false,
    contact_canal_posta: false,
    formErrors: {
        channel: [],
    },
};

class LeadDetails extends Component {
    state = {
        id: this.props.params.id,
        currentTab: TABS.DETAILS,
        initialState,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    callModal = React.createRef();

    async componentDidMount() {
        this.loadLead();
    }

    getStatusLabel(status) {
        return STATUS_LABELS[status] || status;
    }

    getSubstatusLabel(substatus) {
        return SUBSTATUS_LABELS[substatus] || substatus;
    }

    getChannelLabel(channel) {
        if (channel === 'vi') return 'Partener';
        if (channel === 'pe') return 'Punct PPC';
        if (channel === 'ik') return 'Infokiosk';
        if (channel === 'cc') return 'Call Center';
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    isTabSelected(tab) {
        return this.state.currentTab === tab;
    }

    isLeadValid() {
        const lead = this.props.getLeadById(this.state.id);
        if (lead) {
            if (lead.expiry_date) {
                return moment(lead.expiry_date).isAfter(moment());
            }
            return true;
        }
        return false;
    }

    async loadLead() {
        await this.props.fetchLead(this.state.id);
        this.props.fetchLeadLogs(this.state.id);
        this.loadLeadDetails();
        this.loadLeadContact();
    }

    loadLeadDetails() {
        if (this.formApi) {
            const lead = this.props.getLeadById(this.state.id);
            this.formApi.setValues({
                id: lead.id || '-',
                sessionId: lead.sessionId || '-',
                agentId: lead['agent.marca'] || '-',
                fullName: lead.fullName || '-',
                phone: lead.phone || (!!lead.contact && lead.contact.canal_telefon_text) || '-',
                mobile: lead.mobile || '-',
                cnp: this.props.authUser.role === ROLES.AGENT ? 'Indisponibil' : lead.cnp || '-',
                pod: lead.pod || '-',
                consumption: lead.consumption || '-',
                energyType: lead.energyType || '-',
                market: lead.market || '-',
                status: this.getStatusLabel(lead.status) || '-',
                substatus: this.getSubstatusLabel(lead.substatus) || '-',
                source: lead.source || '-',
                channel: lead.channelLabel || '-',
                expiryDate: lead.expiry_date ? moment(lead.expiry_date).format('DD.MM.YYYY') : '-',
                callbackDate: lead.callback_date
                    ? moment(lead.callback_date).format('DD.MM.YYYY')
                    : '-',
                updatedAt: lead.updatedAt ? moment(lead.updatedAt).format('DD.MM.YYYY') : '-',
                createdAt: lead.createdAt ? moment(lead.createdAt).format('DD.MM.YYYY') : '-',
            });
        }
    }

    async loadLeadContact() {
        const lead = this.props.getLeadById(this.state.id);
        const contact = lead.contact;
        if (lead.contact) {
            const data = _.transform(contact, (result, value, key) => {
                result[`contact_${key}`] = value;
            });

            if (contact.acord_mk) {
                await this.handleStateCheckbox({
                    target: { name: 'contact_acord_mk', checked: true },
                });
            }
            if (contact.acord_part) {
                await this.handleStateCheckbox({
                    target: { name: 'contact_acord_part', checked: true },
                });
            }
            if (contact.acord_profil) {
                await this.handleStateCheckbox({
                    target: { name: 'contact_acord_profil', checked: true },
                });
            }

            if (contact.canal_email) {
                this.handleChannelCheckbox({
                    target: { name: 'contact_canal_email', checked: true },
                });
            }
            if (contact.canal_sms) {
                this.handleChannelCheckbox({
                    target: { name: 'contact_canal_sms', checked: true },
                });
            }
            if (contact.canal_telefon) {
                this.handleChannelCheckbox({
                    target: { name: 'contact_canal_telefon', checked: true },
                });
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

            if (address.canal_posta_judet && contact.canal_posta) {
                await this.props.fetchCities(address.canal_posta_judet);
                this.formApi.setValue('canal_posta_judet', address.canal_posta_judet);
                this.setState({ countyLoaded: true });
                if (address.canal_posta_localitate) {
                    await this.props.fetchStreets(address.canal_posta_localitate);
                    this.formApi.setValue('canal_posta_localitate', address.canal_posta_localitate);
                    this.setState({ cityLoaded: true }, () => {
                        this.formApi.setValue('canal_posta_strada', address.canal_posta_strada);
                    });
                }
            }

            this.formApi.setValues(address);

            if (contact.email) {
                this.formApi.setValue('canal', 'email');
                this.handleChannelSelection({ target: { value: 'email' } }, contact.email);
            } else if (contact.telefon) {
                this.formApi.setValue('canal', 'telefon');
                this.handleChannelSelection({ target: { value: 'telefon' } }, contact.telefon);
            }
        }
    }

    handleConfirmClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onConfirm) {
            this.props.onConfirm(e);
        }
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    handleCallLead() {
        this.callModal.current.show();
    }

    async handleConfirmCall(e, note, data, lead) {
        this.handleAddNote(e, note, lead);

        // edit status, substatus & date
        this.props.clearLeadsSelection();
        await this.props.bulkPatch(data, [lead.id]);
        await this.props.clearLeadsList();
        await this.props.fetchLeads();
        await this.props.countEditLeads();
        this.loadLead();
    }

    async handleAddNote(e, note, lead) {
        if (note) {
            const { marca, firstName, lastName } = this.props.authUser;
            if (!lead.notes || !_.isArray(lead.notes)) {
                lead.notes = [];
            }

            lead.notes.push({
                agent: { marca, firstName, lastName },
                value: note,
                createdAt: moment().format(),
            });

            await this.props.patchLead({ id: lead.id, notes: lead.notes });
        }
    }

    async handleCreateSession() {
        const lead = this.props.getLeadById(this.state.id);
        await createSession(lead);
        browserHistory.push('/sessions');
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
                        !this.state.contact_acord_part
                        // &&
                        // !this.state.acord_profil
                    ) {
                        this.setState(
                            {
                                contact_canal_email: false,
                                contact_canal_sms: false,
                                contact_canal_telefon: false,
                                contact_canal_posta: false,
                                acord_profil: false,
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

    handleChannelCheckbox(e) {
        if (this.formApi) {
            const lead = this.props.getLeadById(this.state.id);
            const name = `${e.target.name}_text`.replace('contact_', '');
            if (e.target.checked) {
                this.handleStateCheckbox(e);
                setTimeout(() => {
                    this.formApi.setValue(
                        `contact_${name}`,
                        lead.contact ? lead.contact[name] : ''
                    );
                }, 250);
            } else {
                this.handleStateCheckbox(e);
            }
        }
    }

    handleAddressCheckbox(e) {
        if (this.formApi) {
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
                            this.formApi.setValue(
                                'canal_posta_localitate',
                                values.client_localitate
                            );
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
    }

    renderNote({ agent, value, createdAt }) {
        if (!_.isEmpty(agent)) {
            return (
                <div className="note">
                    <div className="agent">{agent.marca}</div>
                    <div className="created">{moment(createdAt).format('DD.MM.YYYY')}</div>
                    <div className="value">{value}</div>
                </div>
            );
        }
    }

    renderDetails() {
        return (
            <Fragment>
                <div className="row">
                    <Text className="col-md-4" label="id" name="id" display />
                    <Text className="col-md-4" label="Session Id" name="sessionId" display />
                    <Text className="col-md-4" label="Agent Id" name="agentId" display />
                </div>
                <div className="row">
                    <Text className="col-md-4" label="Nume" name="fullName" display />
                    <Text className="col-md-4" label="Telefon Fix" name="phone" display />
                    <Text className="col-md-4" label="Telefon Mobil" name="mobile" display />
                </div>
                <div className="row">
                    <Text className="col-md-4" label="CNP" name="cnp" display />
                    <Text className="col-md-4" label="POD" name="pod" display />
                    <Text className="col-md-4" label="Consum Anual" name="consumption" display />
                </div>
                <div className="row">
                    <Text className="col-md-4" label="Sursa" name="source" display />
                    <Text className="col-md-4" label="Tip Energie" name="energyType" display />
                    <Text className="col-md-4" label="Tip Piata" name="market" display />
                </div>
                <div className="row">
                    <Text className="col-md-4" label="Status" name="status" display />
                    <Text className="col-md-4" label="Substatus" name="substatus" display />
                    <Text className="col-md-4" label="Canal" name="channel" display />
                </div>
                <div className="row">
                    <Text className="col-md-4" label="Data Import" name="createdAt" display />
                    <Text className="col-md-4" label="Data Actualizare" name="updatedAt" display />
                    <Text className="col-md-4" label="Data Expirare" name="expiryDate" display />
                </div>
                <div className="row">
                    <Text
                        className="col-md-4"
                        label="Data Reluare Convorbire"
                        name="callbackDate"
                        display
                    />
                </div>
            </Fragment>
        );
    }

    renderLog(log) {
        if (log.log === 'import') {
            return (
                <div className="log-wrapper">
                    Adaugat de <b>{log['agent.marca']}</b>.
                    <span className="log-date">
                        {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                    </span>
                </div>
            );
        }

        if (log.log === 'update') {
            return (
                <div className="log-wrapper">
                    Actualizat de <b>{log['agent.marca']}</b>.
                    <span className="log-date">
                        {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                    </span>
                </div>
            );
        }

        if (log.log === 'allocate' && log.details) {
            if (log.details.toAgent) {
                return (
                    <div className="log-wrapper">
                        Alocat de <b>{log['agent.marca']}</b> catre agentul{' '}
                        <b>{log.details.toAgent.marca}</b>.
                        <span className="log-date">
                            {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                        </span>
                    </div>
                );
            } else if (log.details.toChannel) {
                return (
                    <div className="log-wrapper">
                        Alocat de <b>{log['agent.marca']}</b> catre canalul{' '}
                        <b>{this.getChannelLabel(log.details.toChannel.type)}</b>.
                        <span className="log-date">
                            {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                        </span>
                    </div>
                );
            } else if (log.details.toCompany) {
                return (
                    <div className="log-wrapper">
                        Alocat de <b>{log['agent.marca']}</b> catre compania{' '}
                        <b>{log.details.toCompany.denumire}</b>.
                        <span className="log-date">
                            {moment(log.createdAt).format('DD.MM.YYYY HH:mm')}
                        </span>
                    </div>
                );
            }
        }
    }

    renderActivity() {
        const { authUser } = this.props;
        return (
            authUser &&
            !(authUser.role === ROLES.AGENT || authUser.role === ROLES.BUM) && (
                <Fragment>
                    <div className="group-name activity">Activitate</div>
                    <div className="activity-container">{this.renderLogs()}</div>
                </Fragment>
            )
        );
    }

    renderMarketingOptions() {
        return (
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
                        acordProfil: this.stat.acord_profil,
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
        );
    }

    renderLogs() {
        let leadLogs = this.props.getLeadLogs(this.state.id);
        return _.map(leadLogs, log => this.renderLog(log));
    }

    renderNotes() {
        const lead = this.props.getLeadById(this.state.id);
        if (lead && lead.notes && lead.notes.length) {
            return _.map(lead.notes, note => this.renderNote(note));
        }

        return <div className="no-notes">Inca nu au fost adaugate notite pentru acest lead.</div>;
    }

    renderConfirmButton() {
        if (this.state.confirmLabel) {
            return (
                <Button primary value={this.state.confirmLabel} onClick={this.handleConfirmClick} />
            );
        }
    }

    renderDismissButton() {
        if (this.state.dismissLabel) {
            return (
                <Button
                    primary
                    underline
                    value={this.state.dismissLabel}
                    onClick={this.handleDismissClick}
                />
            );
        }
    }

    render() {
        const { authUser } = this.props;
        const lead = this.props.getLeadById(this.state.id);
        return (
            <MainLayout>
                <div className="LeadDetails wrapper-content">
                    <div className="sections-wrapper">
                        <Section
                            title="Detalii Lead"
                            isCurrent={true}
                            show={true}
                            className="ClientInfoSection"
                        >
                            <CallModal
                                lead={lead}
                                ref={this.callModal}
                                confirmLabel="Confirma"
                                onConfirm={this.handleConfirmCall}
                                dismissLabel="Anuleazā"
                            />
                            <Form autoComplete="off" getApi={this.setFormApi}>
                                <div className="page-actions">
                                    {this.isLeadValid() && (
                                        <Button
                                            primary
                                            className="create-session-btn"
                                            value="Creeaza Sesiune"
                                            onClick={this.handleCreateSession}
                                        />
                                    )}
                                    {authUser && authUser.role === ROLES.AGENT && (
                                        <Button
                                            secondary
                                            className="call-lead-btn"
                                            value="Call Lead"
                                            onClick={this.handleCallLead}
                                        />
                                    )}
                                </div>
                                <div className="row">
                                    <div className="col-md-6 col-left">
                                        <div className="group-name">Detalii</div>
                                        {this.renderDetails()}
                                        {lead && this.renderMarketingOptions()}
                                    </div>
                                    <div className="col-md-6 col-right">
                                        {this.renderActivity()}
                                        <div className="group-name">Notite</div>
                                        {this.renderNotes()}
                                    </div>
                                </div>
                            </Form>
                        </Section>
                    </div>
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => ({
    authUser: getAuthUser(state),
    cities: getCities(state),
    streets: getStreets(state),
    counties: getCounties(state),
    getLeadById: getLeadById(state),
    getLeadLogs: getLeadLogs(state),
});

const mapDispatchToProps = {
    fetchLead,
    fetchLeadLogs,
    clearLeadsSelection,
    bulkPatch,
    clearLeadsList,
    fetchLeads,
    countEditLeads,
    patchLead,
    fetchCounties,
    fetchCities,
    fetchStreetTypes,
    fetchStreets,
};

export default connect(mapStateToProps, mapDispatchToProps)(LeadDetails);
