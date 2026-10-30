import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../store.js';

import toastr from 'toastr';
import InfiniteScroll from '../infiniteScroll.jsx';

import moment from 'moment';
import { request } from '../../api/index.js';

class Security extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.initLogs();
    }
    render() {
        const { data, total, isLoading, error } = this.props.logs;
        return (
            <InfiniteScroll className="swiper-slide"
                hasMore={error ? false : data.length < total}
                isLoading={isLoading}
                onLoadMore={this.props.loadMore}
            >
                <div className="box">
                    <ul className="table-ul security-logs">
                        <li className="table-ul-header">
                            <ul>
                                <li><strong>Date</strong></li>
                                <li><strong>User</strong></li>
                                <li><strong>Logs</strong></li>
                            </ul>
                        </li>
                        {
                            error ?
                                <ul>
                                    <li>{error}</li>
                                </ul> :
                                data.map((log, i) => <li key={i}>
                                    <ul>
                                        <li>{log.date}</li>
                                        <li>{log.user}</li>
                                        <li>{log.message}</li>
                                    </ul>
                                </li>
                                )}
                    </ul>
                </div>
            </InfiniteScroll>
        );
    }
}

export default connect((state, ownProps) => {
    const slug = ownProps.contract === 'D2D' ? 'd2dlogs' : 'weblogs';
    return {
        router: state.router,
        logs: state[slug]
    };
}, (dispatch, ownProps) => {
    const slug = ownProps.contract === 'D2D' ? 'D2D' : 'WEB';
    const cli = ownProps.contract === 'D2D' ? window.ANDROID_APP1 : window.WEB_APP;
    return {
        initLogs: () => {
            dispatch(async (dispatch, getState) => {
                try {
                    dispatch({ type: `${slug}/LOGS_LOADING` });
                    const logs = await request('GET', `/logs/log?client=${cli}`);
                    const payload = logs.total ?
                        { total: logs.total, data: logs.data } :
                        { error: logs[0].error };
                    dispatch({ type: `${slug}/LOGS_INIT`, payload });
                } catch (err) {
                    dispatch({ type: `${slug}/LOGS_INIT`, payload: { error: 'No logs available !' } });
                }
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                dispatch({ type: `${slug}/LOGS_LOADING` });
                const ci = state.d2dlogs.currentIndex;
                const logs = await request('GET', `/logs/log?client=${cli}&min=${ci + 1}&max=${ci + 100}`);
                dispatch({
                    type: `${slug}/LOGS_APPEND`,
                    payload: {
                        total: logs.total,
                        data: logs.data
                    }
                });
            });
        }
    };
})(Security);