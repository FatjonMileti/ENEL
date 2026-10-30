import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import autoBind from 'react-autobind';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import { Promise } from 'bluebird';
import _ from 'lodash';

import MainLayout from 'layouts/MainLayout';
import ItemOptions from 'components/ItemOptions';
import ItemOption from 'components/ItemOption';
import { Button } from 'components/Button';
import { FormStatus, Checkbox } from 'components/form';
import { hasSearch, hasDateFilters, hasFilters } from 'store/ui/actions';

import ReminderSidebar from './components/ReminderSidebar';
import DetailsModal from './components/DetailsModal';
import NoteModal from './components/NoteModal';
import CallModal from './components/CallModal';
import ImportModal from './components/ImportModal';
import ImportTemplateModal from './components/ImportTemplateModal';
import ImportStatusModal from './components/ImportStatusModal';
import BulkEditModal from './components/BulkEditModal';
import ConfirmModal from 'components/modals/ConfirmModal';
import ErrorModal from 'components/modals/ErrorModal';
import AllocateModal from './components/AllocateModal';
import ReminderModal from './components/ReminderModal';
import ReminderAlertModal from './components/ReminderAlertModal';

import {
    fetchItems as fetchLeads,
    countEditItems as countEditLeads,
    setImportItems as setImportLeads,
    toggleItemSelected as toggleLeadSelected,
    setImportSkip,
    toggleAllSelected,
    bulkEditImport,
    bulkDelete,
    cancelImport,
    bulkPatch,
    patch as patchLead,
    create as createLead,
    setImportError,
    unsetImportErrors,
    clearCache as clearLeadsCache,
    clearList as clearLeadsList,
    clearSelection as clearLeadsSelection,
    removeImportedItem as removeImportedLead,
    refreshImportTotal,
    reportExport,
} from 'store/leads/actions';
import {
    create as createLeadImportTemplate,
    patch as patchLeadImportTemplate,
    deleteItem as deleteLeadImportTemplate,
    fetchItems as fetchLeadImportTemplates,
    setCurrentItem as setCurrentTemplate,
    unsetCurrentItem as unsetCurrentTemplate,
} from 'store/leadImportTemplate/actions';
import {
    createItem as createReminder,
    patch as patchReminder,
    fetchItems as fetchReminders,
} from 'store/reminders/actions';
import { fetchAllItems as fetchAllUsers } from 'store/users/actions';
import { fetchAllItems as fetchAllCompanies } from 'store/companies/actions';
import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { tryFetchUser as tryFetchAuthUser } from 'store/auth/actions';

import { getItemsByLeadId as getLeadLogs } from 'store/leadLogs/selectors';
import {
    getItems as getLeads,
    listImportItems as listImportLeads,
    getSelectedImportItems as getSelectedImportLeads,
    getSelectedItems as getSelectedLeads,
    getSkip,
    getTotal,
    getImportSkip,
    getImportLimit,
    getImportTotal,
    getImportSelected,
    getUploadImportItems,
    isAllSelected,
    selectedKeys,
    hasSelection,
    totalSelected,
    isItemSelected as isLeadSelected,
    getEditTotal,
    getItemById as getLeadById,
    hasImportLeadError,
    getImportLeadError,
} from 'store/leads/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';
import { getItems as getUsers } from 'store/users/selectors';
import { getItems as getCompanies } from 'store/companies/selectors';
import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getReminders } from 'store/reminders/selectors';
import {
    getItems as getLeadImportTemplates,
    getCurrentItem as getCurrentImportTemplate,
} from 'store/leadImportTemplate/selectors';

import {
    LEAD_STATUS,
    STATUS_LABELS,
    SUBSTATUS_MAPPING,
    SUBSTATUS_LABELS,
    IMPORT_ERROR_LABELS,
    CAMPAIGN_TYPES,
} from 'services/lead';

import { ROLES } from 'services/user';

import './LeadsList.scss';

class LeadsList extends Component {
    status = {
        imported: 0,
    };

    importModal = React.createRef();
    importTemplateModal = React.createRef();
    importStatusModal = React.createRef();
    bulkEditModal = React.createRef();
    bulkDeleteModal = React.createRef();
    detailsModal = React.createRef();
    noteModal = React.createRef();
    callModal = React.createRef();
    reminderModal = React.createRef();
    reminderAlertModal = React.createRef();
    allocateModal = React.createRef();
    deallocateModal = React.createRef();
    closeReminderModal = React.createRef();
    importErrorModal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    state = {
        currentLead: null,
        currentLeadError: null,
        currentReminderLead: null,
        currentReminderAlert: null,
        displayReminders: false,
        successful: 0,
        updated: 0,
        errored: 0,
        imported: 0,
        statusFilter: null,
        channels: {
            _1: {
                agentType: 'vi',
                label: 'Partener',
            },
            _2: {
                agentType: 'pe',
                label: 'Punct PPC',
            },
            _3: {
                agentType: 'ik',
                label: 'Infokiosk',
            },
            _4: {
                agentType: 'cc',
                label: 'Call Center',
            },
        },
    };

    async componentDidMount() {
        await this.props.tryFetchAuthUser();
        this.props.hasSearch(true);
        this.props.hasDateFilters(true);
        this.props.hasFilters(true);
        this.props.clearLeadsList();
        this.props.fetchLeads();
        this.props.fetchAllUsers();
        this.props.fetchAllCompanies();
        this.props.fetchCounties();
        this.props.countEditLeads();
        this.props.fetchReminders();
        this.props.fetchLeadImportTemplates();

        this.reminderInterval = setInterval(this.checkReminderAlerts, 30 * 1000);
    }

    componentWillUnmount() {
        this.props.hasSearch(false);
        this.props.hasDateFilters(false);
        this.props.hasFilters(false);
        clearInterval(this.reminderInterval);
    }

    getStatusLabel(lead) {
        let status = STATUS_LABELS[lead.status] || lead.status || '-';

        if (lead.substatus) {
            status += ` / ${SUBSTATUS_LABELS[lead.substatus] || lead.substatus}`;
        }

        return status;
    }

    getStatusOptions() {
        return _.map(LEAD_STATUS, status => ({ value: status, label: STATUS_LABELS[status] }));
    }

    getSubstatusOptions() {
        const { statusFilter } = this.state;

        if (statusFilter && SUBSTATUS_MAPPING[statusFilter]) {
            return _.map(SUBSTATUS_MAPPING[statusFilter], substatus => ({
                value: substatus,
                label: SUBSTATUS_LABELS[substatus],
            }));
        }

        return [];
    }

    getLeadFilters() {
        const { counties, users } = this.props;
        return [
            {
                name: 'source',
                label: 'Sursa',
                options: [
                    {
                        value: 'CROS',
                        label: 'CROS',
                    },
                ],
            },
            {
                name: 'channel',
                label: 'Canal',
                options: [
                    {
                        value: 'vi',
                        label: 'Partener',
                    },
                    {
                        value: 'pe',
                        label: 'Punct PPC',
                    },
                    {
                        value: 'ik',
                        label: 'Infokiosk',
                    },
                    {
                        value: 'cc',
                        label: 'Call Center',
                    },
                ],
            },
            {
                name: 'energyType',
                label: 'Produs',
                options: [
                    {
                        value: 'EE',
                        label: 'Electricitate',
                    },
                    {
                        value: 'GAZ',
                        label: 'Gaz',
                    },
                    {
                        value: 'COMBO',
                        label: 'Combo',
                    },
                ],
            },
            {
                name: 'leadStatus',
                label: 'Status',
                options: this.getStatusOptions(),
                onChange: this.handleStatusFilterChange,
            },
            {
                name: 'county',
                label: 'Judet',
                options: counties.map(item => ({ value: item.denumire, label: item.denumire })),
            },
            {
                name: 'leadSubstatus',
                label: 'Substatus',
                options: this.getSubstatusOptions(),
            },
            {
                name: 'agent_id',
                label: 'Agent',
                options: users.map(item => ({ value: item.id, label: item.marca })),
            },
            {
                name: 'cros.campaign_type',
                label: 'Tip Campanie',
                options: CAMPAIGN_TYPES.map(item => ({ value: item, label: item })),
            },
        ];
    }

    getLeadLogs() {
        const { leadLogs } = this.props;
        if (this.state.currentLead) {
            return leadLogs(this.state.currentLead.id);
        }

        return [];
    }

    getAllocateTitle() {
        const { role } = this.props.authUser;
        if (role === ROLES.LMA) return 'Alocā canal';
        if (role === ROLES.LSA) return 'Alocā companie';
        return 'Alocā agent';
    }

    getAllocateLabel() {
        const { role } = this.props.authUser;
        if (role === ROLES.LMA) return 'Canal';
        if (role === ROLES.LSA) return 'Companie';
        return 'Agent';
    }

    getAllocateOptions() {
        const { role } = this.props.authUser;

        if (role === ROLES.LMA) {
            return _.map(this.state.channels, channel => ({
                value: channel.agentType,
                label: channel.label,
            }));
        }

        if (role === ROLES.LSA) {
            return _.map(this.props.companies, company => ({
                value: company.internal_id,
                label: company.denumire,
            }));
        }

        return _.map(this.props.users, user => ({ value: user.id, label: user.marca }));
    }

    getChannelLabel(value) {
        const channels = _.map(this.state.channels, channel => ({
            value: channel.agentType,
            label: channel.label,
        }));

        const channel = _.find(channels, { value: value });
        return channel ? channel.label : '-';
    }

    getLeadError() {
        const { currentLeadError } = this.state;
        if (currentLeadError) {
            return IMPORT_ERROR_LABELS[currentLeadError] || currentLeadError;
        }
    }

    getGDPRLabel(lead) {
        if (
            lead.contact &&
            lead.contact.acord_part &&
            lead.contact.canal_telefon &&
            lead.contact.canal_telefon_text
        ) {
            return 'DA';
        }

        return 'NU';
    }

    validateLeadImport(lead) {
        if (!lead.fullName) {
            throw new Error('REQUIRED_FULL_NAME');
        }

        if (lead.cros && lead.cros.campaign_type) {
            const campaignType = lead.cros.campaign_type;
            if (!CAMPAIGN_TYPES.includes(campaignType)) {
                throw new Error('INVALID_CAMPAIGN_TYPE');
            }
            if (!lead.contact || !lead.contact.canal_telefon || !lead.contact.canal_telefon_text) {
                throw new Error('MISSING_CAMPAIGN_AGREEMENT_PHONE');
            }
            if (campaignType.match('VAS') && !lead.contact.acord_part) {
                throw new Error('MISSING_CAMPAIGN_AGREEMENT_PART');
            }
        }
    }

    handleStatusFilterChange(e) {
        this.setState({ statusFilter: e.target.value });
    }

    handleMainLoadMore() {
        this.props.fetchLeads();
    }

    handleFiltersChange(e) {
        const { importTotal } = this.props;
        if (importTotal > 0) {
            this.props.clearLeadsSelection();
        } else {
            this.props.clearLeadsList();
            this.props.fetchLeads();
            this.props.countEditLeads();
        }
    }

    handleDetailsClick(currentLead) {
        browserHistory.push(`/leads/${currentLead.id}`);
    }

    handleNoteClick(currentLead) {
        this.setState({ currentLead }, () => this.noteModal.current.show());
    }

    handleCallClick(currentLead) {
        this.setState({ currentLead }, () => this.callModal.current.show());
    }

    handleRemindersClick(currentLead) {
        this.setState({ currentLead }, () => this.reminderModal.current.show());
    }

    handleCloseReminder(lead) {
        this.setState({ currentReminderLead: lead }, () => {
            this.closeReminderModal.current.show();
        });
    }

    handleReminderAlertHide() {
        this.setState({ currentReminderAlert: null });
    }

    handleCloseReminderHide() {
        this.setState({ currentReminderLead: null });
    }

    handleSlideReminderSidebar() {
        const { displayReminders } = this.state;
        displayReminders
            ? this.setState({ displayReminders: false })
            : this.setState({ displayReminders: true });
    }

    async handleCloseReminderConfirm() {
        const { currentReminderLead } = this.state;
        if (currentReminderLead) {
            await this.props.patchReminder(currentReminderLead.id, { active: false });
            await this.props.fetchReminders();
            this.setState({ currentReminderLead: null });
        }
    }

    async handleImportErrorHide() {
        this.setState({ currentLeadError: null });
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

    handleImportLoadMore() {
        const { importSkip, importLimit } = this.props;
        this.props.setImportSkip(importSkip + importLimit);
    }

    handleImportClick(e) {
        this.importTemplateModal.current.show();
    }

    handleAllocateClick(e) {
        this.allocateModal.current.getWrappedInstance().show();
    }

    handleDeallocateClick(e) {
        this.deallocateModal.current.show();
    }

    handleEditClick(e) {
        this.bulkEditModal.current.getWrappedInstance().show();
    }

    handleDeleteClick(e) {
        this.bulkDeleteModal.current.show();
    }

    handleConfirmImport(e, leads) {
        this.props.clearLeadsCache();
        this.props.setImportLeads(leads);
    }

    async handleTemplateConfirm(template, name, id) {
        const {
            createLeadImportTemplate,
            patchLeadImportTemplate,
            setCurrentTemplate,
        } = this.props;
        await setCurrentTemplate(template);
        this.importModal.current.show();

        if (name) {
            createLeadImportTemplate({ name, template });
        }
        if (id) {
            patchLeadImportTemplate(id, { template });
        }
    }

    async handleConfirmEdit(e, data, limit) {
        const { selectedKeys, importTotal } = this.props;
        if (importTotal > 0) {
            this.props.bulkEditImport(data);
        } else {
            this.props.clearLeadsSelection();
            await this.props.bulkPatch(data, selectedKeys, limit);
            await this.props.clearLeadsList();
            await this.props.fetchLeads();
            await this.props.countEditLeads();
        }
    }

    async handleConfirmCall(e, note, data, lead) {
        this.handleAddNote(e, note, lead);

        // edit status, substatus & date
        this.props.clearLeadsSelection();
        await this.props.bulkPatch(data, [lead.id]);
        await this.props.clearLeadsList();
        await this.props.fetchLeads();
        await this.props.countEditLeads();
    }

    async handleConfirmReminder(e, actionDate, lead) {
        await this.props.createReminder({ leadId: lead.id, actionDate });
        await this.props.fetchReminders();
    }

    async handleConfirmDelete(e) {
        const { selectedKeys } = this.props;

        this.props.clearLeadsSelection();
        await this.props.bulkDelete(selectedKeys);
        await this.props.clearLeadsList();
        await this.props.fetchLeads();
        await this.props.countEditLeads();
    }

    async handleImportConfirm(e) {
        const { uploadImportItems } = this.props;
        this.props.unsetImportErrors();
        this.importStatusModal.current.show();
        let i = 0;
        let successful = 0;
        let updated = 0;
        let errored = 0;

        await Promise.map(
            uploadImportItems,
            async lead => {
                try {
                    this.validateLeadImport(lead);
                    await this.props.createLead(lead);
                    await this.props.removeImportedLead(lead);
                    successful++;
                } catch (createError) {
                    if (
                        createError.message &&
                        createError.message.match('DUPLICATED') &&
                        createError.data &&
                        createError.data.leadId
                    ) {
                        const { leadId } = createError.data;
                        try {
                            lead.updatedData = { ...lead.originalData };
                            delete lead.originalData;
                            await this.props.patchLead({ ...lead, id: leadId });
                            await this.props.removeImportedLead(lead);
                            updated++;
                        } catch (updateError) {
                            errored++;
                            await this.props.setImportError(lead, updateError);
                        }
                    } else {
                        errored++;
                        await this.props.setImportError(lead, createError);
                    }
                }
                i++;
                this.setState({ imported: i });
            },
            { concurrency: 1 }
        );

        this.setState({ successful, updated, errored });
    }

    handleReportExport() {
        this.props.reportExport();
    }

    handleImportCancel(e) {
        this.props.cancelImport();
        this.props.clearLeadsCache();
        this.props.fetchLeads();
        this.props.countEditLeads();
    }

    async handleConfirmAllocation(e, id, limit) {
        const { role } = this.props.authUser;

        if (role === ROLES.LMA) {
            await this.handleConfirmEdit(e, { channel: id }, limit);
        } else if (role === ROLES.LSA) {
            await this.handleConfirmEdit(e, { companyId: id }, limit);
        } else {
            await this.handleConfirmEdit(e, { agent_id: id }, limit);
        }
    }

    handleConfirmDeallocation(e, limit) {
        const { role } = this.props.authUser;

        if (role === ROLES.LMA) {
            this.handleConfirmEdit(e, { channel: null });
        } else if (role === ROLES.LSA) {
            this.handleConfirmEdit(e, { companyId: null });
        } else {
            this.handleConfirmEdit(e, { agent_id: null });
        }
    }

    async handleImportModalHide() {
        this.setState({ successful: 0, updated: 0, errored: 0, imported: 0 });
        this.props.refreshImportTotal();
        this.props.clearLeadsSelection();
        await this.props.clearLeadsList();
        await this.props.fetchLeads();
    }

    async handleTemplateDelete(templateId) {
        await this.props.deleteLeadImportTemplate(templateId);
        this.props.fetchLeadImportTemplates();
    }

    handleImportTemplateModalShow() {
        this.props.fetchLeadImportTemplates();
    }

    handleImportErrorClick(lead) {
        const { getImportLeadError } = this.props;
        this.setState(
            { currentLeadError: getImportLeadError(lead) },
            this.importErrorModal.current.show()
        );
    }

    renderImportErrorIcon(lead) {
        const { hasImportLeadError } = this.props;
        return (
            hasImportLeadError(lead) && (
                <i
                    className="import-error-icon ion-md-alert"
                    onClick={() => this.handleImportErrorClick(lead)}
                />
            )
        );
    }

    checkReminderAlert(reminder) {
        const now = moment();
        let { actionDate } = reminder;
        const expiryDate = moment(actionDate);
        const duration = moment.duration(expiryDate.diff(now));
        const minutes = duration.asMinutes();

        if (
            minutes > 0 &&
            minutes < 15 &&
            !this.state.currentReminderAlert &&
            !this.state.currentReminderLead
        ) {
            this.setState(
                { currentReminderAlert: reminder },
                this.reminderAlertModal.current.show()
            );
            return true;
        }

        return false;
    }

    checkReminderAlerts() {
        for (const reminder of this.props.reminders) {
            const alert = this.checkReminderAlert(reminder);
            if (alert) break;
        }
    }

    renderMainLeads() {
        const { skip, total, authUser } = this.props;

        const leads = _.map(this.props.leads, (lead, index) => (
            <tr key={`main-${index}`}>
                <td>
                    {this.renderLeadCheckbox(lead)}
                    {lead.cnp || '-'}
                </td>
                <td>{lead.fullName || '-'}</td>
                <td>{this.getGDPRLabel(lead)}</td>
                <td>{lead.county || '-'}</td>
                <td>{lead['agent.marca'] || '-'}</td>
                <td>{this.getChannelLabel(lead.channel) || '-'}</td>
                <td>{lead.cros ? lead.cros.note || '-' : '-'}</td>
                <td>{this.getStatusLabel(lead)}</td>
                <td>{moment(lead.createdAt).format('DD.MM.YYYY') || '-'}</td>
                <td>
                    {moment(lead.updatedAt).format('DD.MM.YYYY') || '-'}
                    <ItemOptions>
                        <ItemOption
                            icon="ion-md-create"
                            label="Detalii"
                            onClick={() => this.handleDetailsClick(lead)}
                        />
                        <ItemOption
                            icon="ion-md-book"
                            label="Notițe"
                            onClick={() => this.handleNoteClick(lead)}
                        />
                        <ItemOption
                            icon="ion-ios-bookmark"
                            label="Reminders"
                            onClick={() => this.handleRemindersClick(lead)}
                        />
                        {authUser && authUser.role === ROLES.AGENT && (
                            <ItemOption
                                icon="ion-ios-call"
                                label="Call Lead"
                                onClick={() => this.handleCallClick(lead)}
                            />
                        )}
                    </ItemOptions>
                </td>
            </tr>
        ));

        return (
            <InfiniteScroll pageStart={0} loadMore={this.handleMainLoadMore} hasMore={skip < total}>
                <table className="table has-menu-options has-select-checkbox">
                    <thead>
                        <tr>
                            <th scope="col">
                                {this.renderAllCheckbox()}
                                CNP
                            </th>
                            <th scope="col">Client</th>
                            <th scope="col">GDPR Partener Tel.</th>
                            <th scope="col">Judet</th>
                            <th scope="col">Agent</th>
                            <th scope="col">Canal</th>
                            <th scope="col">Notita</th>
                            <th scope="col">Status</th>
                            <th scope="col">Data Import</th>
                            <th scope="col">Data Actualizare</th>
                        </tr>
                    </thead>
                    <tbody>{leads}</tbody>
                </table>
            </InfiniteScroll>
        );
    }

    renderImportLeads() {
        const { importSkip, importTotal, importLeads } = this.props;

        const leads = _.map(importLeads, (lead, index) => (
            <tr key={`import-_${index}`}>
                <td>
                    {this.renderLeadCheckbox(lead)}
                    {this.renderImportErrorIcon(lead)}
                    {lead.cnp || '-'}
                </td>
                <td>{lead.fullName || '-'}</td>
                <td>{this.getGDPRLabel(lead)}</td>
                <td>{lead.county || '-'}</td>
                <td>{lead['agent.marca'] || '-'}</td>
                <td>{lead.energyType || '-'}</td>
                <td>{this.getChannelLabel(lead.channel) || '-'}</td>
                <td>{lead.cros ? lead.cros.note || '-' : '-'}</td>
                <td>{this.getStatusLabel(lead)}</td>
            </tr>
        ));

        return (
            <InfiniteScroll
                pageStart={0}
                loadMore={this.handleImportLoadMore}
                hasMore={importSkip < importTotal}
            >
                <table className="table has-menu-options has-select-checkbox">
                    <thead>
                        <tr>
                            <th scope="col">
                                {this.renderAllCheckbox()}
                                CNP
                            </th>
                            <th scope="col">Client</th>
                            <th scope="col">GDPR Partener Tel.</th>
                            <th scope="col">Judet</th>
                            <th scope="col">Agent</th>
                            <th scope="col">Produs</th>
                            <th scope="col">Canal</th>
                            <th scope="col">Notita</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>{leads}</tbody>
                </table>
            </InfiniteScroll>
        );
    }

    renderLeads() {
        if (this.props.importTotal > 0) {
            return this.renderImportLeads();
        }
        return this.renderMainLeads();
    }

    renderImportMessage() {
        const { uploadImportItems } = this.props;
        if (uploadImportItems.length) {
            return <FormStatus message={`Se importā ${uploadImportItems.length} lead-uri.`} />;
        }
    }

    renderSelectMessage() {
        const { isAllSelected, totalSelected, selectedKeys, importTotal } = this.props;
        if ((isAllSelected || selectedKeys.length > 0) && !importTotal) {
            return <FormStatus message={`${totalSelected} lead-uri selectate.`} />;
        }
    }

    renderAllCheckbox() {
        const { isAllSelected, toggleAllSelected } = this.props;
        return (
            <div className="checkbox-wrapper">
                <Checkbox onClick={toggleAllSelected} display checked={isAllSelected} />
            </div>
        );
    }

    renderLeadCheckbox(lead) {
        const { isLeadSelected, isAllSelected, toggleLeadSelected } = this.props;
        const { role } = this.props.authUser;
        if (
            role &&
            (![ROLES.LMA, ROLES.LSA].includes(role) ||
                ![
                    LEAD_STATUS.INTERMEDIARY,
                    LEAD_STATUS.FINAL,
                    LEAD_STATUS.CUSTOMER,
                    LEAD_STATUS.LOST_SALE,
                ].includes(lead.status))
        ) {
            return (
                <div className="checkbox-wrapper">
                    <Checkbox
                        onClick={() => toggleLeadSelected(lead)}
                        display
                        checked={isAllSelected || isLeadSelected(lead)}
                    />
                </div>
            );
        }
    }

    renderImportButton() {
        const { role } = this.props.authUser;

        if (role && ![ROLES.LSA, ROLES.BUM].includes(role)) {
            return <Button primary value="Importā" onClick={this.handleImportClick} />;
        }
    }

    renderEditButton() {
        const { hasSelection } = this.props;
        const { role } = this.props.authUser;

        if (role && ![ROLES.LSA].includes(role)) {
            return (
                <Button
                    secondary
                    disabled={!hasSelection}
                    value="Editeazā"
                    onClick={this.handleEditClick}
                />
            );
        }
    }

    renderDeleteButton() {
        const { hasSelection } = this.props;
        const { role } = this.props.authUser;

        if (role && [ROLES.ADMIN, ROLES.LMA, ROLES.LRA, ROLES.LSA].includes(role)) {
            return (
                <Button
                    secondary
                    disabled={!hasSelection}
                    value="Șterge"
                    onClick={this.handleDeleteClick}
                />
            );
        }
    }

    renderDeallocateButton() {
        const { hasSelection } = this.props;
        const { role } = this.props.authUser;

        if (role && [ROLES.ADMIN, ROLES.LMA, ROLES.LRA, ROLES.LSA].includes(role)) {
            return (
                <Button
                    secondary
                    disabled={!hasSelection}
                    value="Dealocā"
                    onClick={this.handleDeallocateClick}
                />
            );
        }
    }

    renderSliderButton() {
        const { reminders } = this.props;
        const { displayReminders } = this.state;
        return (
            !_.isEmpty(reminders) && (
                <i
                    className={`${
                        displayReminders
                            ? 'ion-md-arrow-dropright-circle'
                            : 'ion-md-arrow-dropleft-circle'
                    }`}
                    onClick={() => this.handleSlideReminderSidebar()}
                />
            )
        );
    }

    renderMainButtons() {
        const { importTotal, hasSelection } = this.props;
        const { role } = this.props.authUser;
        if (role && ![ROLES.LRA, ROLES.AGENT].includes(role)) {
            if (!importTotal) {
                return (
                    <div className="page-actions">
                        {this.renderImportButton()}
                        <Button
                            secondary
                            disabled={!hasSelection}
                            value="Alocā"
                            onClick={this.handleAllocateClick}
                        />
                        {this.renderDeallocateButton()}
                        {this.renderEditButton()}
                        {this.renderDeleteButton()}
                    </div>
                );
            }
        }
    }

    renderImportButtons() {
        const { importTotal, hasSelection, uploadImportItems } = this.props;
        if (importTotal > 0) {
            return (
                <Fragment>
                    <div className="page-center-actions">
                        <Button
                            primary
                            value="Importā"
                            onClick={this.handleImportConfirm}
                            disabled={!uploadImportItems || !uploadImportItems.length}
                        />
                        <Button
                            primary
                            underline
                            value="Anuleazā"
                            onClick={this.handleImportCancel}
                        />
                    </div>
                    <div className="page-actions">
                        <Button
                            secondary
                            disabled={!hasSelection}
                            value="Alocā"
                            onClick={this.handleAllocateClick}
                        />
                        <Button
                            secondary
                            disabled={!hasSelection}
                            value="Editeazā"
                            onClick={this.handleEditClick}
                        />
                    </div>
                </Fragment>
            );
        }
    }

    renderReportExport() {
        const { authUser } = this.props;

        const reportExport =
            authUser.role === ROLES.LRA ? (
                <div className="page-actions">
                    <Button primary value="Exporta Raport" onClick={this.handleReportExport} />
                </div>
            ) : null;

        return reportExport;
    }

    render() {
        const { reminders, importSelected } = this.props;
        const { displayReminders } = this.state;

        return (
            <MainLayout
                filters={this.getLeadFilters()}
                searchLabel="Search Lead"
                onSearchChange={this.handleFiltersChange}
                onDateChange={this.handleFiltersChange}
                onFilterChange={this.handleFiltersChange}
            >
                <ImportModal
                    ref={this.importModal}
                    onConfirm={this.handleConfirmImport}
                    template={this.props.currentImportTemplate}
                />
                <ImportTemplateModal
                    ref={this.importTemplateModal}
                    templates={this.props.templates}
                    onConfirm={this.handleTemplateConfirm}
                    onShow={this.handleImportTemplateModalShow}
                    onTemplateDelete={this.handleTemplateDelete}
                    confirmLabel="Confirmā"
                    dismissLabel="Anuleazā"
                />
                <ImportStatusModal
                    ref={this.importStatusModal}
                    imported={this.state.imported}
                    successful={this.state.successful}
                    updated={this.state.updated}
                    errored={this.state.errored}
                    total={importSelected}
                    onHide={this.handleImportModalHide}
                />
                <BulkEditModal ref={this.bulkEditModal} onConfirm={this.handleConfirmEdit} />
                <ConfirmModal
                    title="Ești sigur că vrei să ștergi aceste lead-uri?"
                    confirmLabel="Șterge"
                    dismissLabel="Anuleazā"
                    ref={this.bulkDeleteModal}
                    onConfirm={this.handleConfirmDelete}
                />
                <DetailsModal
                    lead={this.state.currentLead}
                    leadLogs={this.getLeadLogs()}
                    ref={this.detailsModal}
                    confirmLabel="OK"
                />
                <NoteModal
                    lead={this.state.currentLead}
                    ref={this.noteModal}
                    confirmLabel="Confirma"
                    onConfirm={this.handleAddNote}
                    dismissLabel="Anuleazā"
                />
                <CallModal
                    lead={this.state.currentLead}
                    ref={this.callModal}
                    extendedValability={this.handleExtendedValibilty}
                    confirmLabel="Confirma"
                    onConfirm={this.handleConfirmCall}
                    dismissLabel="Anuleazā"
                />
                <ReminderModal
                    lead={this.state.currentLead}
                    ref={this.reminderModal}
                    confirmLabel="Confirma"
                    onConfirm={this.handleConfirmReminder}
                    dismissLabel="Anuleazā"
                />
                <ReminderAlertModal
                    data={this.state.currentReminderAlert}
                    ref={this.reminderAlertModal}
                    onHide={this.handleReminderAlertHide}
                    onConfirm={e => this.handleCloseReminder(this.state.currentReminderAlert)}
                />
                <AllocateModal
                    ref={this.allocateModal}
                    title={this.getAllocateTitle()}
                    dataLabel={this.getAllocateLabel()}
                    agents={this.getAllocateOptions()}
                    onConfirm={this.handleConfirmAllocation}
                />
                <ConfirmModal
                    title="Ești sigur că vrei să dealoci aceste lead-uri?"
                    confirmLabel="Dealocā"
                    dismissLabel="Anuleazā"
                    ref={this.deallocateModal}
                    onConfirm={this.handleConfirmDeallocation}
                />
                <ConfirmModal
                    title="Esti sigur ca vrei sa inchizi acest reminder?"
                    confirmLabel="Inchide"
                    dismissLabel="Anuleaza"
                    ref={this.closeReminderModal}
                    onHide={this.handleCloseReminderHide}
                    onConfirm={this.handleCloseReminderConfirm}
                />
                <ErrorModal
                    title="Eroare Import"
                    confirmLabel="OK"
                    errors={[this.getLeadError()]}
                    ref={this.importErrorModal}
                    onHide={this.handleImportErrorHide}
                />

                <div className="LeadsList">
                    {!_.isEmpty(reminders) && (
                        <div
                            className={`wrapper-content reminder-sidebar ${
                                displayReminders ? 'expanded' : ''
                            }`}
                        >
                            <ReminderSidebar onCloseReminder={this.handleCloseReminder} />
                        </div>
                    )}
                    <div
                        className={`wrapper-content ${
                            !_.isEmpty(reminders) && displayReminders ? 'main' : ''
                        }`}
                    >
                        <h1 className="page-title">Leads</h1>
                        {this.renderMainButtons()}
                        {this.renderImportButtons()}
                        {this.renderImportMessage()}
                        {this.renderSelectMessage()}
                        {this.renderSliderButton()}
                        {this.renderReportExport()}
                        <div className="content">{this.renderLeads()}</div>
                    </div>
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => ({
    authUser: getAuthUser(state),
    users: getUsers(state),
    companies: getCompanies(state),
    leads: getLeads(state),
    counties: getCounties(state),
    importLeads: listImportLeads(state),
    selectedImportLeads: getSelectedImportLeads(state),
    selectedLeads: getSelectedLeads(state),
    skip: getSkip(state),
    total: getTotal(state),
    importSkip: getImportSkip(state),
    importLimit: getImportLimit(state),
    importTotal: getImportTotal(state),
    importSelected: getImportSelected(state),
    editTotal: getEditTotal(state),
    uploadImportItems: getUploadImportItems(state),
    isAllSelected: isAllSelected(state),
    selectedKeys: selectedKeys(state),
    hasSelection: hasSelection(state),
    totalSelected: totalSelected(state),
    isLeadSelected: isLeadSelected(state),
    leadLogs: getLeadLogs(state),
    reminders: getReminders(state),
    getLeadById: getLeadById(state),
    getImportLeadError: getImportLeadError(state),
    hasImportLeadError: hasImportLeadError(state),
    templates: getLeadImportTemplates(state),
    currentImportTemplate: getCurrentImportTemplate(state),
});

const mapDispatchToProps = {
    fetchAllUsers,
    fetchAllCompanies,
    fetchLeads,
    fetchCounties,
    countEditLeads,
    patchLead,
    createLead,
    setImportError,
    unsetImportErrors,
    bulkDelete,
    clearLeadsCache,
    clearLeadsList,
    clearLeadsSelection,
    setImportLeads,
    setImportSkip,
    toggleAllSelected,
    toggleLeadSelected,
    bulkEditImport,
    bulkPatch,
    cancelImport,
    hasSearch,
    hasDateFilters,
    hasFilters,
    createReminder,
    patchReminder,
    fetchReminders,
    removeImportedLead,
    refreshImportTotal,
    createLeadImportTemplate,
    patchLeadImportTemplate,
    deleteLeadImportTemplate,
    fetchLeadImportTemplates,
    setCurrentTemplate,
    unsetCurrentTemplate,
    tryFetchAuthUser,
    reportExport,
};

export default connect(mapStateToProps, mapDispatchToProps)(LeadsList);
