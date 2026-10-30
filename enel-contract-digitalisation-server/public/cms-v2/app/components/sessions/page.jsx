import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../store.js';

import toastr from 'toastr';

import InfiniteScroll from '../infiniteScroll.jsx';
import OverviewStatsContainer from '../overview/components/overviewStatsContainer.jsx';
import moment from 'moment';
import api from '../../api/index.js';

import downloader from '../../helpers/download.js';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import { parseLastStep, parseStatus, parseType } from '../../helpers/parse.js';

class Contracts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: null
        };

        this.item_onclick = this.item_onclick.bind(this);
        this.downloadRequest_onclick = this.downloadRequest_onclick.bind(this);
        this.open_agent_profile_onclick = this.open_agent_profile_onclick.bind(this);
    }

    componentDidMount() {
        this.props.initSessions();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.initSessions();

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.initSessions();
                break;
            }
        }
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

    open_agent_profile_onclick(id) {
        return (e) => {
            return this.props.navigate(`/easyofficers/${id}`);
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

    column_onclick(column) {
        return () => {
            this.props.sort(column, false);
            this.props.initSessions();
        };
    }

    handleAgentClick(session) {
        if (session.client_app != window.WEB_APP) {
            return this.props.navigate(`/easyofficers/${session.agent_id}`);
        }
    }

    render() {
        return (
            <InfiniteScroll className="swiper-slide"
                hasMore={this.props.session.total > this.props.session?.list?.length}
                isLoading={this.props.session.isLoading}
                onLoadMore={this.props.loadMore}>
                <OverviewStatsContainer />
                <div className="box">
                    <ul className="table-ul contracts-list">
                        <li className="table-ul-header">
                            <ul>
                                <li className='pointer' onClick={this.column_onclick('type')}><strong>Tip</strong>{this.props.session.sortColumn === 'type' ? <i className={this.props.session.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i> : null}</li>
                                <li className='pointer' onClick={this.column_onclick('agent][firstName')}><strong>Agent</strong>{this.props.session.sortColumn === 'agent][firstName' ? <i className={this.props.session.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i> : null}</li>
                                <li className='pointer' onClick={this.column_onclick('agent][canal][denumire')}><strong>Company</strong>{this.props.session.sortColumn === 'agent][canal][denumire' ? <i className={this.props.session.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i> : null}</li>
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
                                            <li><strong className="clickable" onClick={() => this.handleAgentClick(session)}>{session.client_app === window.WEB_APP ? 'Fast Contract' : `${session['agent.firstName'] || ''} ${session['agent.lastName'] || ''}`}</strong></li>
                                            <li><strong>{session.client_app === window.WEB_APP ? 'Fast Contract' : session['agent.canal.denumire']}</strong></li>
                                            <li><strong>{parseStatus(session)}</strong></li>
                                            <li><strong>{session.id}</strong></li>
                                            <li><strong>{parseLastStep(session)}</strong></li>
                                            <li><strong>{moment(session.createdAt).format('HH:mm DD.MM.YYYY')}</strong></li>
                                        </ul>

                                        {session.agent_id || hasRequest ?
                                            <i onClick={this.item_onclick(session.id)} className="icon-wlc-more-options square-btn-light trigger-edit-row"></i>
                                            : null
                                        }
                                        <div className={`more-options-list dynamic-list`}>
                                            {session.agent_id ?
                                                <span onClick={this.open_agent_profile_onclick(session.agent_id)}><i className="icon-wlc-agent"></i>Open Agent Profile</span>
                                                : null
                                            }
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
            </InfiniteScroll >
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        session: state.session,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters
    };
}, dispatch => {
    return {
        sort: (column, ascending) => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'SESSION/SORT_SESSIONS', payload: { column, ascending } });
            });
        },
        export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);

                let url = `${window.location.origin}/cms/proxy/excel?$sort[createdAt]=-1`;
                for (const filter of filters)
                    url += `&${filter.column}=${filter.value}`;
                window.open(url);
            });
        },
        initSessions: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                dispatch({ type: 'SESSION/SESSION_LOADING' });

                const filters = buildFiltersFromState.forSession(state);
                let sessions = await api.session.all(50,
                    0,
                    state.session.sortColumn || 'createdAt',
                    state.session.ascending,
                    filters
                );

                dispatch({
                    type: 'SESSION/INIT_SESSIONS', payload: {
                        total: sessions.total,
                        sortColumn: state.session.sortColumn || 'createdAt',
                        ascending: state.session.ascending,
                        data: sessions.data,
                    }
                });
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();

                dispatch({ type: 'SESSION/SESSION_LOADING' });

                const filters = buildFiltersFromState.forSession(state);
                let sessions = await api.session.all(50,
                    state.session.currentIndex,
                    state.session.sortColumn,
                    state.session.ascending,
                    filters);
                dispatch({ type: 'SESSION/APPEND_SESSIONS', payload: sessions });
            });
        },
        selectAgent: (id) => {
            dispatch({ type: 'SELECT_AGENT', payload: id });
        }
    };
})(Contracts);
