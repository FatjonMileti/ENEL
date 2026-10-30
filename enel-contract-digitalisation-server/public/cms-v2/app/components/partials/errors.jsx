import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../store.js';

import toastr from 'toastr';
import InfiniteScroll from '../infiniteScroll.jsx';

import moment from 'moment';
import { request } from '../../api/index.js';

class Errors extends React.Component {
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
                    <ul className="table-ul security-errors">
                        <li className="table-ul-header">
                            <ul>
                                <li><strong>Date</strong></li>
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
                                        <li>{log.message}</li>
                                    </ul>
                                </li>
                                )}
                    </ul>
                </div>
            </InfiniteScroll >
        );
    }
}

export default connect((state, ownProps) => {
    return {
        router: state.router,
        logs: state.err,
    };
}, (dispatch, ownProps) => {
    return {
        initLogs: () => {
            dispatch(async (dispatch, getState) => {
                try {
                    dispatch({ type: `ERR_LOADING` });
                    const logs = await request('GET', `/logs/err`);
                    const payload = logs.total > 0 ?
                        { total: logs.total, data: logs.data, isLoading: false } :
                        { error: logs[0].error };
                    dispatch({ type: `ERR_INIT`, payload });
                } catch (err) {
                    dispatch({ type: `ERR_INIT`, payload: { error: 'No logs available !' } });
                }
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                dispatch({ type: `ERR_LOADING` });
                const ci = state.logs.currentIndex;
                const logs = await request('GET', `/logs/err?min=${ci + 1}&max=${ci + 100}`);
                dispatch({
                    type: `ERR_APPEND`,
                    payload: {
                        total: logs.total,
                        data: logs.data
                    }
                });
            });
        }
    };
})(Errors);