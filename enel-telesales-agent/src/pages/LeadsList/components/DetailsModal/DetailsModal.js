import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import moment from 'moment';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './DetailsModal.scss';
import { Text, Form } from 'components/form';

const TABS = {
    DETAILS: 'DETAILS',
    NOTES: 'NOTES',
    LOGS: 'LOGS',
};

class DetailsModal extends Component {
    state = {
        currentTab: TABS.DETAILS,
    };

    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
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

    isTabSelected(tab) {
        return this.state.currentTab === tab;
    }

    loadLeadDetails() {
        if (this.formApi) {
            const { lead } = this.props;
            this.formApi.setValues({
                id: lead.id || '-',
                sessionId: lead.sessionId || '-',
                agentId: lead['agent.marca'] || '-',
                fullName: lead.fullName || '-',
                phone: lead.phone || '-',
                mobile: lead.mobile || '-',
                cnp: lead.cnp || '-',
                pod: lead.pod || '-',
                consumption: lead.consumption || '-',
                energyType: lead.energyType || '-',
                market: lead.market || '-',
                status: lead.status || '-',
                source: lead.source || '-',
                channel: lead.channelLabel || '-',
                expiryDate: lead.expiry_date ? moment(lead.expiry_date).format('DD.MM.YYYY') : '-',
                createdAt: lead.createdAt ? moment(lead.createdAt).format('DD.MM.YYYY') : '-',
            });
        }
    }

    handleShow() {
        const { onShow } = this.props;
        disableBodyScroll(this.modal.current);
        this.loadLeadDetails();
        if (onShow) {
            onShow();
        }
    }

    handleHide() {
        const { onHide } = this.props;
        enableBodyScroll(this.modal.current);
        if (onHide) {
            onHide();
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

    handleTabClick(tab) {
        this.setState({ currentTab: tab }, () => {
            if (tab === TABS.DETAILS) {
                this.loadLeadDetails();
            }
        });
    }

    renderTitle() {
        const { lead } = this.props;
        let title = 'Detalii Lead';
        if (lead && (lead.firstName || lead.lastName)) {
            title = [lead.firstName, lead.lastName].join(' ');
        }
        return <div className="title">{title}</div>;
    }

    renderTabs() {
        return (
            <div className="tabs-wrapper">
                <div
                    className={`tab ${this.isTabSelected(TABS.DETAILS) ? 'active' : ''}`}
                    onClick={() => this.handleTabClick(TABS.DETAILS)}
                >
                    Detalii
                </div>
                <div
                    className={`tab ${this.isTabSelected(TABS.LOGS) ? 'active' : ''}`}
                    onClick={() => this.handleTabClick(TABS.LOGS)}
                >
                    Activitate
                </div>
                <div
                    className={`tab ${this.isTabSelected(TABS.NOTES) ? 'active' : ''}`}
                    onClick={() => this.handleTabClick(TABS.NOTES)}
                >
                    Notite
                </div>
            </div>
        );
    }

    renderConfirmButton() {
        if (this.props.confirmLabel) {
            return (
                <Button primary value={this.props.confirmLabel} onClick={this.handleConfirmClick} />
            );
        }
    }

    renderDismissButton() {
        if (this.props.dismissLabel) {
            return (
                <Button
                    primary
                    underline
                    value={this.props.dismissLabel}
                    onClick={this.handleDismissClick}
                />
            );
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

    renderDetailsTab() {
        if (this.state.currentTab === TABS.DETAILS) {
            return (
                <Form autoComplete="off" getApi={this.setFormApi}>
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
                        <Text
                            className="col-md-4"
                            label="Consum Anual"
                            name="consumption"
                            display
                        />
                    </div>
                    <div className="row">
                        <Text className="col-md-4" label="Tip Energie" name="energyType" display />
                        <Text className="col-md-4" label="Tip Piata" name="market" display />
                        <Text className="col-md-4" label="Status" name="status" display />
                    </div>
                    <div className="row">
                        <Text className="col-md-4" label="Sursa" name="source" display />
                        <Text className="col-md-4" label="Canal" name="channel" display />
                        <Text
                            className="col-md-4"
                            label="Data de expirare"
                            name="expiryDate"
                            display
                        />
                    </div>
                    <div className="row">
                        <Text className="col-md-4" label="Creat la" name="createdAt" display />
                    </div>
                </Form>
            );
        }
    }

    renderLog(log) {
        if (log.log === 'import') {
            return (
                <div>
                    Adaugat de <b>{log.agent_id}</b>. (
                    <i>{moment(log.createdAt).format('DD.MM.YYYY HH:mm')}</i>)
                </div>
            );
        }

        if (log.log === 'allocate') {
            return (
                <div>
                    Alocat de <b>{log.agent_id}</b> catre{' '}
                    <b>
                        {log.details.toAgent.lastName} {log.details.toAgent.firstName}
                    </b>{' '}
                    cu marca <b>{log.details.toAgent.marca}</b>. (
                    <i>{moment(log.createdAt).format('DD.MM.YYYY HH:mm')}</i>)
                </div>
            );
        }
    }

    renderLogsTab() {
        if (this.state.currentTab === TABS.LOGS) {
            const { leadLogs } = this.props;
            return _.map(leadLogs, log => this.renderLog(log));
        }
    }

    renderNotesTab() {
        if (this.state.currentTab === TABS.NOTES) {
            const { lead } = this.props;
            if (lead && lead.notes && lead.notes.length) {
                return _.map(lead.notes, note => this.renderNote(note));
            }
        }
    }

    render() {
        return (
            <DropModal
                className="DetailsModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    {this.renderTitle()}
                    {this.renderTabs()}
                    <div className="data-panel">
                        {this.renderDetailsTab()}
                        {this.renderLogsTab()}
                        {this.renderNotesTab()}
                    </div>
                    {this.renderConfirmButton()}
                    {this.renderDismissButton()}
                </div>
            </DropModal>
        );
    }
}

export default DetailsModal;
