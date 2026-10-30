import React from 'react';
import { connect } from 'react-redux';

import InfiniteScroll from '../infiniteScroll';
import moment from 'moment';
import api from '../../api';

import downloader from '../../helpers/download';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import toastr from 'toastr';
import DropModal from 'reboron/DropModal';

import { parseLastStep, parseStatus, parseType } from '../../helpers/parse.js';

class AgentDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isMenuOpen: false,
            selectedId: null
        };
        this.item_onclick = this.item_onclick.bind(this);
        this.block_onclick = this.block_onclick.bind(this);
        this.profile_onclick = this.profile_onclick.bind(this);
        this.downloadRequest_onclick = this.downloadRequest_onclick.bind(this);
    }

    componentDidMount() {
        this.props.initAgent(this.props.match.params.id);
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.id != prevProps.match.params.id)
            this.props.initAgent(this.props.match.params.id);

        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.initAgent(this.props.match.params.id);

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.initAgent(this.props.match.params.id);
                break;
            }
        }
    }

    showModal(e) {
        e.preventDefault();
        this.refs.modal.show();
    }

    hideModal(e) {
        e.preventDefault();
        this.refs.modal.hide();
    }

    async handleModal(e) {
        e.preventDefault();
        const mess = await api.common.get('reset-password', this.props.match.params.id);
        if (mess.success) {
            toastr.success(
                `Password was reset and was send to user by ${process.env.NODE_ENV !== 'development' ? 'SMS' : 'EMAIL'}!`,
                'Password was reset successfully!',
                {
                    timeOut: 3000,
                    fadeOut: 3000
                }
            );
        } else {
            toastr.warning(
                'First, please check if user has phone number! If user has phone number receive this message again, please contact application support!',
                'Something wrong happened!',
                {
                    timeOut: 5000,
                    fadeOut: 5000
                }
            )
        }
        this.refs.modal.hide();
    }

    item_onclick(id) {
        return (e) => {
            e.stopPropagation();

            if (id !== this.state.selectedId)
                this.setState({ selectedId: id });
            else
                this.setState({ selectedId: null });
        };
    }

    async downloadRequest_onclick(e) {
        let id = this.state.selectedId;
        let details = await api.session.details(id);
        if (details.xml) {
            downloader(`session_${id}.xml`, 'text/xml', details.xml);
        }
        else
            toastr.info('No request data available');
    }

    block_onclick(e) {
        e.preventDefault();
        toastr.info('Not implemented');
    }

    profile_onclick(e) {
        e.preventDefault();
        this.props.history.push(`/officerprofile/${this.props.match.params.id}`);
    }

    column_onclick(column) {
        return () => {
            this.props.sort(column, false);
            this.props.initAgent(this.props.match.params.id);
        };
    }

    renderBlockButton(user) {
        if (this.props.isAdmin) {
            return (
                <span onClick={e => this.block_onclick(e)}>
                    <i className={user.isActive ? "icon-wlc-block-2" : "icon-wlc-ok"}></i>{user.isActive ? 'Suspend' : 'Activate'}
                </span>
            );
        }
    }

    render() {
        const id = this.props.match.params.id;
        const user = this.props.info;
        if (user === null)
            return null;

        return ([
            <div className="content" key={0}>
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Easy Officer</h3>
                    </div>
                    <div className="content-box-body" onClick={() => { this.setState({ isMenuOpen: false }); }}>
                        <InfiniteScroll className="scrollbar"
                            hasMore={this.props.session.total > this.props.session?.list?.length}
                            isLoading={this.props.session.isLoading}
                            onLoadMore={this.props.loadMore}>
                            <div className={`box items-3 profile-box${this.state.isMenuOpen ? ' view-more-options-list' : ''}`}>
                                <div className="profile-box-img"><img src="/cms/img/svg/user.svg" alt="" /></div>
                                <div className="table">
                                    <div className="table-cell">
                                        <h2>{user.firstName} {user.lastName}</h2>
                                        <div className="profile-box-grid">
                                            <div className="profile-box-cell">
                                                <p>Mark: <strong>{user.marca}</strong></p>
                                                <p>Teamleader: <strong>{user.managerMarca ? `${user['manager.firstName'] || 'n/a'} ${user['manager.lastName'] || ''}` : 'n/a'}</strong></p>
                                                <p>Partner: <strong>{user['canal.denumire'] || 'n/a'}</strong></p>
                                            </div>
                                            <div className="profile-box-cell">
                                                <p>App: <strong>PPC Easy</strong></p>
                                                <p>Last login: <strong>{user.lastLogin ? moment(user.lastLogin).format('DD.MM.YYYY') : 'n/a'}</strong></p>
                                                <p>Valid until: <strong>{user.validityEndDate ? moment(user.validityEndDate).format('DD.MM.YYYY') : 'n/a'}</strong></p>
                                            </div>
                                            <div className="profile-box-cell">
                                                <p><a onClick={e => e.preventDefault()} className="cnt-btn" href="#">Phone: <strong>{user.phone || 'n/a'}</strong></a></p>
                                                <p><a onClick={e => e.preventDefault()} className="cnt-btn" href="#">Email: <strong>{user.email || 'n/a'}</strong></a></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <i className="icon-wlc-more-options square-btn-light trigger-profile-options" onClick={(e) => { e.stopPropagation(); this.setState({ isMenuOpen: !this.state.isMenuOpen }); }}></i>
                                <div className="more-options-list">
                                    <span onClick={this.profile_onclick}><i className="icon-wlc-agent"></i>Profile</span>
                                    <span><i className="icon-wlc-info"></i>Activity</span>
                                    { this.renderBlockButton(user) }
                                    <span onClick={e => this.showModal(e)}><i className="icon-wlc-alert"></i>Reset password</span>
                                </div>
                            </div>

                            <div className="box">
                                <ul className="stats">
                                    <li>
                                        <strong>Contracts started</strong>
                                        <span>{this.props.session.total}</span>
                                    </li>
                                    {
                                        this.props.filters.pages ? <li></li> :
                                            <li>
                                                <strong>Contracts activated</strong>
                                                <span>{
                                                    this.props.filters.statuses === 'ERRORED' ?
                                                        0 : this.props.filters.statuses === 'REJECTED' ?
                                                            0 : this.props.filters.statuses === 'PENDING' ?
                                                                0 : this.props.filters.statuses === 'UNFINISHED' ?
                                                                    0 : this.props.session.count.activatedTrue
                                                }</span>
                                            </li>
                                    }
                                    {
                                        this.props.filters.pages ? <li></li> :
                                            <li>
                                                <strong>Unfinished contracts</strong>
                                                <span>{
                                                    this.props.filters.statuses === 'ERRORED' ?
                                                        this.props.session.total : this.props.filters.statuses === 'REJECTED' ?
                                                            this.props.session.total : this.props.filters.statuses === 'PENDING' ?
                                                                0 : this.props.filters.statuses === 'UNFINISHED' ?
                                                                    this.props.session.total : this.props.session.total - this.props.session.count.activatedTrue
                                                }</span>
                                            </li>
                                    }
                                    <li>
                                        <a onClick={this.props.export_onclick} className="button blue right" href="#" title=""><i className="icon-wlc-download-arrow"></i>Download Report</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="box mar0b">
                                {/* <ul className="table-ul agent-profile-list">
                                    <li className="table-ul-header">
                                        <ul>
                                            <li><strong>Contract Status</strong></li>
                                            <li><strong>Session ID</strong></li>
                                            <li><strong>Product</strong></li>
                                            <li><strong>Date</strong></li>
                                        </ul>
                                    </li>
                                    <li>
                                        <ul>
                                            <li><strong>Contract Status</strong></li>
                                            <li><strong>Session ID</strong></li>
                                            <li><strong>Product</strong></li>
                                            <li><strong>Date</strong></li>
                                        </ul>
                                        <i className="icon-wlc-download-arrow square-btn-light"></i>
                                    </li>
                                </ul> */}

                                <ul className="table-ul contracts-list">
                                    <li className="table-ul-header">
                                        <ul>
                                            <li className='pointer' onClick={this.column_onclick('type')}><strong>Tip</strong>{this.props.session.sortColumn === 'type' ? <i className={this.props.session.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i> : null}</li>
                                            <li><strong>Contract status</strong></li>
                                            <li className='pointer' onClick={this.column_onclick('id')}><strong>Session ID</strong>{this.props.session.sortColumn === 'id' ? <i className={this.props.session.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i> : null}</li>
                                            <li><strong>Last Step</strong></li>
                                            <li className='pointer' onClick={this.column_onclick('createdAt')}><strong>Date</strong>{this.props.session.sortColumn === 'createdAt' ? <i className={this.props.session.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i> : null}</li>
                                        </ul>
                                    </li>
                                    {
                                        this.props.session?.list?.map(session => {
                                            let hasRequest = false;
                                            if (session.type === 'EE' && session.ee_offer_date)
                                                hasRequest = true;
                                            if (session.type === 'GAZ' && session.gaz_offer_date)
                                                hasRequest = true;
                                            if (session.type === 'COMBO' && (session.ee_offer_date || session.gaz_offer_date))
                                                hasRequest = true;

                                            hasRequest = hasRequest && this.props.isAdmin;

                                            return (
                                                <li key={session.id} onClick={() => { this.setState({ selectedId: null }); }} className={session.id === this.state.selectedId ? 'view-more-options-list' : ''}>
                                                    <ul>
                                                        <li><strong>{parseType(session.type)}</strong></li>
                                                        <li><strong>{parseStatus(session)}</strong></li>
                                                        <li><strong>{session.id}</strong></li>
                                                        <li><strong>{parseLastStep(session)}</strong></li>
                                                        <li><strong>{moment(session.createdAt).format('HH:mm DD.MM.YYYY')}</strong></li>
                                                    </ul>

                                                    {hasRequest ?
                                                        <i onClick={this.item_onclick(session.id)} className="icon-wlc-more-options square-btn-light trigger-edit-row"></i>
                                                        :
                                                        null
                                                    }
                                                    <div className={`more-options-list single-option`}>
                                                        {
                                                            hasRequest ?
                                                                <span onClick={this.downloadRequest_onclick}><i className="icon-wlc-download-arrow"></i>Download Request/Response</span>
                                                                : null
                                                        }
                                                    </div>
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                        </InfiniteScroll>
                    </div>
                </div>

            </div>,
            <div className="flex-sidebar" key={1}>
                <div className="flex-sidebar-header">
                    <h3>Agents Activity Overview</h3>
                </div>
                <div className="scrollbar">
                    <div className="box">
                        <p className="panel">
                            <span>Status:</span>
                            <strong><i className={`icon-wlc-active${user.isActive ? ' active' : ''}`}></i>{user.isActive ? 'Active' : 'Inactive'}</strong>
                        </p>
                        <p className="panel">
                            <span>Last login:</span>
                            <strong><i className="icon-wlc-calendar"></i>{user.lastLogin ? moment(user.lastLogin).format('DD.MM.YYYY h:mm A') : 'n/a'}</strong>
                        </p>
                    </div>
                    <h3 className="flex-sidebar-title-2">Contract Status</h3>
                    <div className="box mar0b">
                        <ul className="stats">
                            <li>
                                <strong>Total contracts today</strong>
                                <span>{this.props.counter.today}</span>
                            </li>
                            <li>
                                <strong>Total contracts this week</strong>
                                <span>{this.props.counter.week}</span>
                            </li>
                            <li>
                                <strong>Total contracts this month</strong>
                                <span>{this.props.counter.month}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>,
            <div key={2} className="view-overlay-alert">
                <DropModal
                    className="modal overlay-alert"
                    ref={'modal'}>
                    <div className="overlay-content">
                        <i
                            className="icon-wlc-close close-button-overlay close-overlay"
                            onClick={e => this.hideModal(e)}
                        />
                        <div className="overlay-body">
                            <div className="scrool-bar">
                                <h3>Are you sure?</h3>
                                <p>{`This will reset the user's password and send it by ${process.env.NODE_ENV !== 'development' ? 'SMS' : 'EMAIL'}!`}</p>
                                <p>{`Are you sure?`}</p>
                                <p className="align-center">
                                    <button className="button blue close-overlay" onClick={async e => this.handleModal(e)}>
                                        {'RESET PASSWORD'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </DropModal>
            </div>]
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        info: state.agent.info,
        session: state.agent.sessions,
        counter: state.agent.sessions.count,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters
    };
}, dispatch => {
    return {
        sort: (column, ascending) => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'AGENT/SORT_SESSIONS', payload: { column, ascending } });
            });
        },
        export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);

                let url = `${window.location.origin}/cms/proxy/excel?agent_id=${state.agent.info.id}&$sort[createdAt]=-1`;
                for (const filter of filters)
                    url += `&${filter.column}=${filter.value}`;
                window.open(url);
            });
        },
        initAgent: (id) => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                dispatch({ type: 'AGENT/SESSION_LOADING' });

                let agent = await api.user.get(id);
                let isActive = await api.user.isActive(id);

                const today = await api.user.countToday(id);
                const week = await api.user.countWeek(id);
                const month = await api.user.countMonth(id);

                const filters = buildFiltersFromState.forSession(state);
                let sessions = await api.user.sessions(50,
                    0,
                    state.agent.sessions.sortColumn || 'createdAt',
                    state.agent.sessions.ascending,
                    id,
                    filters
                );

                const closed = await api.user.countClosed(id,
                    filters
                );
                const activatedTrue = await api.user.countActivatedTrue(id,
                    filters
                );

                dispatch({
                    type: 'INIT_AGENT', payload: {
                        info: {
                            ...agent,
                            isActive
                        },

                        total: sessions.total,
                        sortColumn: state.agent.sessions.sortColumn || 'createdAt',
                        ascending: state.agent.sessions.ascending,
                        data: sessions.data,

                        closed,
                        activatedTrue,

                        today,
                        week,
                        month
                    }
                });
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();

                dispatch({ type: 'AGENT/SESSION_LOADING' });

                const filters = buildFiltersFromState.forSession(state);
                let sessions = await api.user.sessions(50,
                    state.agent.sessions.currentIndex,
                    state.agent.sessions.sortColumn,
                    state.agent.sessions.ascending,
                    state.agent.info.id,
                    filters
                );
                dispatch({ type: 'AGENT/APPEND_SESSIONS', payload: sessions });
            });
        }
    };
})(AgentDetails);
