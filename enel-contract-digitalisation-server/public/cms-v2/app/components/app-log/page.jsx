import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { history } from '../../store.js';

import InfiniteScroll from '../infiniteScroll.jsx';
import moment from 'moment';
import api from '../../api/index.js';

import downloader from '../../helpers/download.js';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import { parseLastStep, parseStatus, parseType } from '../../helpers/parse.js';

import _ from 'lodash';

class AppLog extends React.Component {
    state = {
        selectedId: null
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.initAppLogs();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.initAppLogs();

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.initAppLogs();
                break;
            }
        }
    }

    handleSort() {
        this.props.sortAppLogs();
        this.props.initAppLogs();
    }

    renderItems() {
        return _.map(this.props.app_log.data, item => (
            <li key={item.id} onClick={() => { this.setState({ selectedId: null }); }} className={item.id === this.state.selectedId ? 'view-more-options-list' : ''}>
                <ul>
                    <li><strong>{item.sessionId}</strong></li>
                    <li><strong>{item.page || '-'}</strong></li>
                    <li className="app-log-details"><strong>{item.details}</strong></li>
                    <li><strong>{moment(item.createdAt).format('HH:mm DD.MM.YYYY')}</strong></li>
                </ul>
            </li>
        ));
    }

    render() {
        return (
            <InfiniteScroll className="AppLog swiper-slide"
                hasMore={this.props.app_log.total > this.props.app_log.data.length}
                isLoading={this.props.app_log.isLoading}
                onLoadMore={this.props.loadMore}>
                    <div className="box">
                        <ul className="table-ul contracts-list">
                            <li className="table-ul-header">
                                <ul>
                                    <li><strong>Session Id</strong></li>
                                    <li><strong>Page</strong></li>
                                    <li className="app-log-details"><strong>Details</strong></li>
                                    <li className="pointer" onClick={this.handleSort}>
                                        <strong>Date</strong>
                                        <i className={this.props.app_log.ascending ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}></i>
                                    </li>
                                </ul>
                            </li>
                            {this.renderItems()}
                        </ul>
                    </div>
            </InfiniteScroll>
        );
    }
}

export default connect(state => {
    return {
        app_log: state.app_log,
        router: state.router,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters
    };
}, dispatch => {
    return {
        initAppLogs: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'APP_LOG_LOADING' });
                const state = getState();
                const filters = buildFiltersFromState.forAppLog(state);

                let result = await api.app_log.all(
                    20,
                    0,
                    state.app_log.sortColumn || 'createdAt',
                    state.app_log.ascending,
                    window.WEB_APP,
                    filters
                );
                dispatch({ type: 'APP_LOG/ALL', payload: result });
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'APP_LOG/LOADING' });
                const state = getState();
                const filters = buildFiltersFromState.forAppLog(state);

                let result = await api.app_log.all(
                    20,
                    state.app_log.currentIndex,
                    state.app_log.sortColumn,
                    state.app_log.ascending,
                    window.WEB_APP,
                    filters
                );
                dispatch({ type: 'APP_LOG/APPEND', payload: result });
            });
        },
        sortAppLogs: () => {
            dispatch({ type: 'APP_LOG/SORT' });
        }
    };
})(AppLog);