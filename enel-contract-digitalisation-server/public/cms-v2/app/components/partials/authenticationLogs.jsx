import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { history } from '../../store.js';
import _ from 'lodash';
import autoBind from 'react-autobind';

import toastr from 'toastr';
import InfiniteScroll from '../infiniteScroll.jsx';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import api from '../../api/index.js';

import moment from 'moment-timezone';
import { request } from '../../api/index.js';

class AuthenticationLogs extends React.Component {

    state = {
        startHour: "00",
        startMinute: "00",
        endHour: "23",
        endMinute: "59",
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.initAuthLogs(this.state);
    }

    componentDidUpdate(prevProps) {
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.initAuthLogs(this.state);
    }

    handleTimeChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        }, () => {
            this.props.initAuthLogs(this.state)
        });
    }

    render() {
        const { data, total, isLoading, error } = this.props.auth_logs;
        return (
            <Fragment> 
                <InfiniteScroll className="swiper-slide"
                    hasMore={true}
                    isLoading={isLoading}
                    onLoadMore={() => this.props.loadMore(this.state)}
                >
                    <div className="time-picker">
                        <span className="start-date">Start Date</span>
                        <select name="startHour" value={this.state.startHour} onChange={this.handleTimeChange}>
                            {_.range(0, 24).map(item => <option value={item < 10 ? `0${item}` : item }>{item < 10 ? `0${item}` : item }</option>)}
                        </select>
                        <select name="startMinute" value={this.state.startMinute} onChange={this.handleTimeChange}>
                            {_.range(0, 60).map(item => <option value={item < 10 ? `0${item}` : item }>{item < 10 ? `0${item}` : item }</option>)}
                        </select>
                        <span className="end-date">End Date</span>
                        <select name="endHour" value={this.state.endHour} onChange={this.handleTimeChange}>
                            {_.range(0, 24).map(item => <option value={item < 10 ? `0${item}` : item }>{item < 10 ? `0${item}` : item }</option>)}
                        </select>
                        <select name="endMinute" value={this.state.endMinute} onChange={this.handleTimeChange}>
                            {_.range(0, 60).map(item => <option value={item < 10 ? `0${item}` : item }>{item < 10 ? `0${item}` : item }</option>)}
                        </select>
                        <span className="total-logs">Total: <b>{total}</b></span>
                    </div>

                    <div className="box">
                        <ul className="table-ul security-logs auth-logs">
                            <li className="table-ul-header">
                                <ul>
                                    <li><strong>Date</strong></li>
                                    <li><strong>Client</strong></li>
                                    <li><strong>Marca</strong></li>
                                </ul>
                            </li>
                            {
                                error ?
                                    <ul>
                                        <li>{error}</li>
                                    </ul> :
                                    data.map((log, i) => <li key={i}>
                                        <ul>
                                            <li>{moment(log.createdAt).format("HH:mm DD.MM.YYYY")}</li>
                                            <li>{log.client || '-'}</li>
                                            <li>{log.payload ? log.payload.user || '-' : '-'}</li>
                                        </ul>
                                    </li>
                                    )}
                        </ul>
                    </div>
                </InfiniteScroll>
            </Fragment>
        );
    }
}

export default connect((state, ownProps) => {
    return {
        router: state.router,
        auth_logs: state.auth_logs,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
    };
}, (dispatch, ownProps) => {
    return {
        initAuthLogs: (compState) => {
            dispatch(async (dispatch, getState) => {
                try {
                    dispatch({ type: `AUTH_LOGS_LOADING` });
                    const state = getState();
                    const filters = buildFiltersFromState.forSession(state);
                    let startDate = filters.find(item => item.column === "createdAt[$gte]");
                    let endDate = filters.find(item => item.column === "createdAt[$lt]");

                    let startValue = startDate ? moment(startDate.value, "YYYYMMDD") : '';
                    let endValue = endDate ? moment(endDate.value, "YYYYMMDD").subtract(1, 'days') : '';

                    startValue = startValue.add(parseInt(compState.startHour), 'hours').add(parseInt(compState.startMinute), 'minutes');

                    endValue = endValue.add(parseInt(compState.endHour), 'hours').add(parseInt(compState.endMinute), 'minutes');

                    startDate = startDate ? `&${startDate.column}=${startValue.tz("Europe/Rome").format('YYYY-MM-DD HH:mm')}` : '';
                    endDate = endDate ? `&${endDate.column}=${endValue.tz("Europe/Rome").format('YYYY-MM-DD HH:mm')}` : '';

                    const authLogs = await request('GET', `/app-log?type=AUTHENTICATION${startDate}${endDate}&$sort[id]=-1`);

                    const payload = authLogs.total ?
                        { total: authLogs.total, data: authLogs.data } :
                        { error: authLogs[0].error };
                    dispatch({ type: `AUTH_LOGS_INIT`, payload });
                } catch (err) {
                    dispatch({ type: `AUTH_LOGS_INIT`, payload: { error: 'No logs available !' } });
                }
            });
        },
        loadMore: (compState) => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);
                let startDate = filters.find(item => item.column === "createdAt[$gte]");
                let endDate = filters.find(item => item.column === "createdAt[$lt]");

                let startValue = startDate ? moment(startDate.value, "YYYYMMDD") : '';
                let endValue = endDate ? moment(endDate.value, "YYYYMMDD").subtract(1, 'days') : '';

                startValue = startValue.add(parseInt(compState.startHour), 'hours').add(parseInt(compState.startMinute), 'minutes');

                endValue = endValue.add(parseInt(compState.endHour), 'hours').add(parseInt(compState.endMinute), 'minutes');

                startDate = startDate ? `&${startDate.column}=${startValue.tz("Europe/Rome").format('YYYY-MM-DD HH:mm')}` : '';
                endDate = endDate ? `&${endDate.column}=${endValue.tz("Europe/Rome").format('YYYY-MM-DD HH:mm')}` : '';

                dispatch({ type: `AUTH_LOGS_LOADING` });
                const ci = state.auth_logs.currentIndex;
                const authLogs = await request('GET', `/app-log?type=AUTHENTICATION&$limit=${100}&$skip=${ci+1}${startDate}${endDate}&$sort[id]=-1`);

                dispatch({
                    type: `AUTH_LOGS_APPEND`,
                    payload: {
                        total: authLogs.total,
                        data: authLogs.data
                    }
                });
            });
        }
    };
})(AuthenticationLogs);