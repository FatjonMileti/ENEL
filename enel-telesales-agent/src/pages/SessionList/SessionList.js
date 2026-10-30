import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import autoBind from 'react-autobind';
import InfiniteScroll from 'react-infinite-scroller';
import moment from 'moment';
import _ from 'lodash';

import pageService from 'services/page';
import sessionService from 'services/session';
import { ROLES } from 'services/user';

import {
    fetchItems as fetchSessions,
    fetchItem as fetchSession,
    clearList as clearSessions,
    toggleItemSelected as toggleSessionSelected,
    clearSelection,
    toggleAllSelected,
    bulkPatch,
    rejectOffer,
    setContractType,
} from 'store/session/actions';
import { fetchAllItems as fetchAllUsers } from 'store/users/actions';
import { sendSessionLink, markIncompleteDocs } from 'store/client/actions';
import { hasDateFilters, hasFilters } from 'store/ui/actions';
import {
    getItems as getSessions,
    getLimit,
    getTotal,
    getSkip,
    isAllSelected,
    selectedKeys,
    hasSelection,
    totalSelected,
    isItemSelected as isSessionSelected,
} from 'store/session/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';
import { getItems as getUsers } from 'store/users/selectors';

import MainLayout from 'layouts/MainLayout';
import { Button } from 'components/Button';
import ConfirmModal from 'components/modals/ConfirmModal';
import SendLinkModal from 'components/modals/SendLinkModal';
import RejectModal from 'components/modals/RejectModal';
import { FormStatus, Checkbox } from 'components/form';
import ItemOptions from 'components/ItemOptions';
import ItemOption from 'components/ItemOption';
import AllocateModal from './components/AllocateModal';

import './SessionList.scss';

class SessionList extends Component {
    state = {
        currentSession: null,
    };

    sendLinkModal = React.createRef();
    incompleteDocsModal = React.createRef();
    rejectModal = React.createRef();
    allocateModal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.hasDateFilters(true);
        this.props.hasFilters(true);
        this.props.clearSessions();
        this.props.fetchSessions();
        this.props.fetchAllUsers();
    }

    componentWillUnmount() {
        this.props.hasDateFilters(false);
        this.props.hasFilters(false);
    }

    getUsersOptions() {
        return _.map(this.props.users, user => ({ value: user.id, label: user.marca }));
    }

    getGeneratedDocsURL(session, flow) {
        return `${process.env.REACT_APP_API_URL}/landing/${session.hash}/${
            session.id
        }/Documente.zip?type=${flow.toUpperCase()}`;
    }

    getUploadedDocsURL(session) {
        const { id, hash } = session;
        return `${process.env.REACT_APP_API_URL}/uploaded/all/${id}/${hash}/UploadedDocs.zip`;
    }

    getSendLinkContact() {
        const session = this.state.currentSession;

        if (!_.isEmpty(session)) {
            const contact = session.ee_contact || session.gaz_contact;
            if (contact && (contact.email || contact.telefon)) {
                return contact.email || contact.telefon;
            }
        }
    }

    getSessionFilters() {
        const { authUser } = this.props;
        const filters = [
            {
                name: 'type',
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
                name: 'status',
                label: 'Status',
                options: [
                    {
                        value: 'CLIENT_OFFER_ACCEPTED',
                        label: sessionService.getStatusLabel('CLIENT_OFFER_ACCEPTED'),
                    },
                    //{
                    //     value: 'CLIENT_OFFER_SENT',
                    //     label: sessionService.getStatusLabel('CLIENT_OFFER_SENT'),
                    // },
                    {
                        value: 'CLIENT_DOCS_NOT_UPLOADED',
                        label: sessionService.getStatusLabel('CLIENT_DOCS_NOT_UPLOADED'),
                    },
                    {
                        value: 'CLIENT_DOCS_UPLOADED',
                        label: sessionService.getStatusLabel('CLIENT_DOCS_UPLOADED'),
                    },
                    {
                        value: 'CLIENT_CONTRACT_SENT_SMS',
                        label: sessionService.getStatusLabel('CLIENT_CONTRACT_SENT_SMS'),
                    },
                    {
                        value: 'CLIENT_CONTRACT_SENT_EMAIL',
                        label: sessionService.getStatusLabel('CLIENT_CONTRACT_SENT_EMAIL'),
                    },
                    {
                        value: 'ACTIVATED',
                        label: sessionService.getStatusLabel('ACTIVATED'),
                    },
                    {
                        value: 'REJECTED',
                        label: sessionService.getStatusLabel('REJECTED'),
                    },
                ],
            },
        ];

        if (authUser.role === ROLES.CM) {
            filters.push({
                name: 'agent_id',
                label: 'Agent',
                options: this.getUsersOptions(),
            });
        }

        return filters;
    }

    hasGeneratedDocs(session, flow) {
        return !_.isEmpty(session[`${flow}_generated_documents`]);
    }

    hasUploadedDocs(session) {
        return !_.isEmpty(session.ee_documents) || !_.isEmpty(session.gaz_documents);
    }

    shouldDisableLinkInput() {
        const { currentSession } = this.state;
        if (currentSession) {
            return !!currentSession.client_upload_agree_date;
        }
        return true;
    }

    handleSendClick(e, session) {
        this.setState({ currentSession: session }, () => {
            this.sendLinkModal.current.show();
        });
    }

    handleIncompleteDocsClick(e, session) {
        this.setState({ currentSession: session }, () => {
            this.incompleteDocsModal.current.show();
        });
    }

    handleRejectClick(e, session) {
        this.setState({ currentSession: session }, () => {
            this.rejectModal.current.show();
        });
    }

    handleAllocateClick(e) {
        this.allocateModal.current.show();
    }

    handleCreateB2bClick() {
        this.props.setContractType('b2b');
        browserHistory.push(pageService.links.sessionDetails);
    }

    handleCreateB2cClick() {
        this.props.setContractType('b2c');
        browserHistory.push(pageService.links.sessionDetails);
    }

    handleCautaPOSFClick() {
        browserHistory.push(pageService.links.searchPlace);
    }

    searchData() {
        browserHistory.push(pageService.links.searchData);
    }

    handleSendOfferClick() {
        browserHistory.push(pageService.links.sendOffer);
    }

    handleEditClick(e, session) {
        browserHistory.push(`/sessions/${session.id}/${session.hash}`);
    }

    handleSendConfirm(e, contact) {
        const { id } = this.state.currentSession;
        if (id) {
            this.props.sendSessionLink(id, contact);
        }
    }

    async handleConfirmAllocation(e, agentId) {
        const { selectedKeys } = this.props;
        this.props.clearSelection();
        if (agentId) {
            await this.props.bulkPatch({ agent_id: agentId }, selectedKeys);
            await this.props.clearSessions();
            await this.props.fetchSessions();
        }
    }

    handleIncompleteDocsConfirm(e) {
        const { id } = this.state.currentSession;
        if (id) {
            this.props.markIncompleteDocs(id);
        }
    }

    async handleRejectConfirm(e, reason) {
        const { rejectOffer, fetchSession } = this.props;
        const { id, type } = this.state.currentSession;
        if (id) {
            if (type === 'COMBO') {
                await rejectOffer(id, 'EE', reason);
                await rejectOffer(id, 'GAZ');
            } else {
                await rejectOffer(id, type, reason);
            }
        }
        fetchSession(id);
    }

    handleFiltersChange() {
        this.props.clearSessions();
        this.props.fetchSessions();
    }

    renderAllCheckbox() {
        const { isAllSelected, toggleAllSelected, authUser } = this.props;
        if (authUser.role === ROLES.CM) {
            return (
                <div className="checkbox-wrapper">
                    <Checkbox onClick={toggleAllSelected} display checked={isAllSelected} />
                </div>
            );
        }
    }

    renderSessionCheckbox(session) {
        const { isSessionSelected, isAllSelected, toggleSessionSelected, authUser } = this.props;
        if (authUser.role === ROLES.CM) {
            return (
                <div className="checkbox-wrapper">
                    <Checkbox
                        onClick={() => toggleSessionSelected(session)}
                        display
                        checked={isAllSelected || isSessionSelected(session)}
                    />
                </div>
            );
        }
    }

    renderIncompleteDocs(session) {
        if (!session.is_fast_flow && session.link_sent_date) {
            return (
                <ItemOption
                    icon="ion-md-close"
                    label="Reminder e-mail/sms documente incomplete"
                    onClick={e => this.handleIncompleteDocsClick(e, session)}
                />
            );
        }
    }

    renderRejectOffer(session) {
        if (session.ee_agree == null && session.gaz_agree == null && session.id && session.type) {
            return (
                <ItemOption
                    icon="ion-md-close"
                    label="Refuză contract"
                    onClick={e => this.handleRejectClick(e, session)}
                />
            );
        }
    }

    renderDownloadUploadedDocs(session) {
        if (this.hasUploadedDocs(session)) {
            return (
                <ItemOption
                    icon="ion-md-download"
                    label="Descarcă documentele încărcate"
                    href={this.getUploadedDocsURL(session)}
                    anchor
                />
            );
        }
    }

    renderDownloadGeneratedDocs(session) {
        const items = [];
        if (this.hasGeneratedDocs(session, 'ee')) {
            items.push(
                <ItemOption
                    icon="ion-md-download"
                    label="Documente generate electricitate"
                    href={this.getGeneratedDocsURL(session, 'ee')}
                    hide={!session.type}
                    key={0}
                    anchor
                />
            );
        }
        if (this.hasGeneratedDocs(session, 'gaz')) {
            items.push(
                <ItemOption
                    icon="ion-md-download"
                    label="Documente generate gaze naturale"
                    href={this.getGeneratedDocsURL(session, 'gaz')}
                    hide={!session.type}
                    key={0}
                    anchor
                />
            );
        }

        return items;
    }

    renderItemOptions(session) {
        const { authUser } = this.props;
        if (authUser.id === session.agent_id) {
            return (
                <ItemOptions>
                    <ItemOption
                        icon="ion-md-create"
                        label="Editează"
                        onClick={e => this.handleEditClick(e, session)}
                    />
                    {!session.is_fast_flow && session.link_sent_date && (
                        <ItemOption
                            icon="ion-ios-link"
                            label="Trimite Link"
                            onClick={e => this.handleSendClick(e, session)}
                        />
                    )}
                    {this.renderIncompleteDocs(session)}
                    {this.renderRejectOffer(session)}
                    {this.renderDownloadGeneratedDocs(session)}
                    {this.renderDownloadUploadedDocs(session)}
                </ItemOptions>
            );
        }
    }

    renderSessions() {
        const { authUser } = this.props;
        return _.map(this.props.sessions, (session, index) => (
            <tr key={index}>
                <td>
                    {this.renderSessionCheckbox(session)}
                    {session.type || '-'}
                </td>
                {authUser.role === ROLES.CM && <td>{session['agent.marca'] || ''}</td>}
                <td>
                    {session.contract_type === 'b2c' &&
                    session.client &&
                    (session.client.nume || session.client.prenume)
                        ? `${session.client.nume || ''} ${session.client.prenume || ''}`
                        : session.contract_type === 'b2b' &&
                          session.company &&
                          session.company.data.nume &&
                          session.company.data.nume
                        ? session.company.data.nume
                        : '-'}
                </td>
                <td>{session.id || '-'}</td>
                <td>{session.contract_type && session.contract_type.toUpperCase()}</td>
                <td>{sessionService.getStatus(session) || '-'}</td>
                <td>
                    {session.createdAt ? moment(session.createdAt).format('DD.MM.YYYY') : '-'}
                    {this.renderItemOptions(session)}
                </td>
            </tr>
        ));
    }

    renderSelectMessage() {
        const { totalSelected } = this.props;
        if (totalSelected > 0) {
            return <FormStatus message={`${totalSelected} sesiuni selectate.`} />;
        }
    }

    render() {
        const { limit, total, skip, hasSelection, authUser, fetchSessions } = this.props;
        return (
            <MainLayout
                filters={this.getSessionFilters()}
                onDateChange={this.handleFiltersChange}
                onFilterChange={this.handleFiltersChange}
            >
                <ConfirmModal
                    title="Esti sigur ca vrei sa trimiti reminder cu documente incomplete ?"
                    confirmLabel="Trimite"
                    dismissLabel="Anuleaza"
                    ref={this.incompleteDocsModal}
                    onConfirm={this.handleIncompleteDocsConfirm}
                />
                <SendLinkModal
                    ref={this.sendLinkModal}
                    contact={this.getSendLinkContact()}
                    onConfirm={this.handleSendConfirm}
                    disableInput={this.shouldDisableLinkInput()}
                />
                <AllocateModal
                    ref={this.allocateModal}
                    agents={this.getUsersOptions()}
                    onConfirm={this.handleConfirmAllocation}
                />
                <RejectModal ref={this.rejectModal} onConfirm={this.handleRejectConfirm} />
                <div className="SessionList">
                    <div className="wrapper-content">
                        <h1 className="page-title">Overview</h1>
                        <div className="page-actions">
                            {/*  <Button
                                     primary
                                     value="Trimite Oferta"
                                     //disabled={true}
                                     onClick={this.handleSendOfferClick}
                                 /> */}
                            <Button outlined value="CAUTARE SALESFORCE" onClick={this.searchData} />
                            <Button
                                outlined
                                value="Cauta POSF"
                                onClick={this.handleCautaPOSFClick}
                            />
                            <Button
                                outlined
                                value="Contract firma"
                                onClick={this.handleCreateB2bClick}
                            />
                            <Button
                                outlined
                                value="Contract persoana fizica"
                                onClick={this.handleCreateB2cClick}
                            />
                            {authUser.role === ROLES.CM && (
                                <Button
                                    secondary
                                    disabled={!hasSelection}
                                    value="Realocā"
                                    onClick={this.handleAllocateClick}
                                />
                            )}
                        </div>
                        {this.renderSelectMessage()}
                        <div className="content">
                            <InfiniteScroll
                                pageStart={0}
                                loadMore={fetchSessions}
                                hasMore={skip + limit < total}
                            >
                                <table
                                    className={`table has-menu-options ${
                                        authUser.role === ROLES.CM ? 'has-select-checkbox' : ''
                                    }`}
                                >
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                {this.renderAllCheckbox()}
                                                Tip
                                            </th>
                                            {authUser.role === ROLES.CM && (
                                                <th scope="col">Agent</th>
                                            )}
                                            <th scope="col">Client</th>
                                            <th scope="col">Session ID</th>
                                            <th scope="col">Contract Type</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Datā</th>
                                        </tr>
                                    </thead>
                                    <tbody>{this.renderSessions()}</tbody>
                                </table>
                            </InfiniteScroll>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => ({
    authUser: getAuthUser(state),
    users: getUsers(state),
    sessions: getSessions(state),
    skip: getSkip(state),
    limit: getLimit(state),
    total: getTotal(state),
    isAllSelected: isAllSelected(state),
    hasSelection: hasSelection(state),
    totalSelected: totalSelected(state),
    selectedKeys: selectedKeys(state),
    isSessionSelected: isSessionSelected(state),
});

const mapDispatchToProps = {
    fetchAllUsers,
    fetchSessions,
    fetchSession,
    clearSessions,
    clearSelection,
    sendSessionLink,
    markIncompleteDocs,
    toggleSessionSelected,
    toggleAllSelected,
    bulkPatch,
    rejectOffer,
    hasDateFilters,
    hasFilters,
    setContractType,
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionList);
