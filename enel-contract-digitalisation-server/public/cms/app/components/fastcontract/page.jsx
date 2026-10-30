import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../store.js';

import InfiniteScroll from '../infiniteScroll.jsx';
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
            history.push(`easyofficers/${id}`);
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

    render() {
        return (
            <InfiniteScroll className="swiper-slide"
                hasMore={this.props.session.total > this.props.session?.list?.length}
                isLoading={this.props.session.isLoading}
                onLoadMore={this.props.loadMore}>
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
                <div className="box">
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
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        session: state.websession,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters
    };
}, dispatch => {
    return {
        sort: (column, ascending) => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'WEB/SORT_SESSIONS', payload: { column, ascending } });
            });
        },
        export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);

                let url = `${window.location.origin}/cms/proxy/excel?client_app=${window.WEB_APP}&$sort[createdAt]=-1`;
                for (const filter of filters)
                    url += `&${filter.column}=${filter.value}`;
                window.open(url);
            });
        },
        initSessions: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                dispatch({ type: 'WEB/SESSION_LOADING' });

                const filters = buildFiltersFromState.forSession(state);
                let sessions = await api.session.all(50,
                    0,
                    state.websession.sortColumn || 'createdAt',
                    state.websession.ascending,
                    window.WEB_APP,
                    filters
                );

                const closed = await api.session.countClosed(window.WEB_APP,
                    filters);
                const activatedTrue = await api.session.countActivatedTrue(
                    window.WEB_APP,
                    filters);

                const today = await api.session.countToday(window.WEB_APP);
                const week = await api.session.countWeek(window.WEB_APP);
                const month = await api.session.countMonth(window.WEB_APP);

                dispatch({
                    type: 'WEB/INIT_SESSIONS', payload: {
                        total: sessions.total,
                        sortColumn: state.websession.sortColumn || 'createdAt',
                        ascending: state.websession.ascending,
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

                dispatch({ type: 'WEB/SESSION_LOADING' });

                const filters = buildFiltersFromState.forSession(state);
                let sessions = await api.session.all(50,
                    state.websession.currentIndex,
                    state.websession.sortColumn,
                    state.websession.ascending,
                    window.WEB_APP,
                    filters
                );
                dispatch({ type: 'WEB/APPEND_SESSIONS', payload: sessions });
            });
        },
        selectAgent: (id) => {
            dispatch({ type: 'SELECT_AGENT', payload: id });
        }
    };
})(Contracts);
