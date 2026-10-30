import React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { history } from '../../store.js';

import toastr from 'toastr';

import InfiniteScroll from '../infiniteScroll.jsx';
import ConnectivityStats from './components/connectivityStats.jsx';
import LiveChart from './components/liveChart.jsx';
import moment from 'moment';
import api from '../../api/index.js';

import _ from 'lodash';

class Pings extends React.Component {
    state = {
        selectedId: null,
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.initPings();
        this.getPingsInterval = setInterval(() => {
            this.props.initPings();
        }, 5000);
    }

    componentWillUnmount() {
        clearInterval(this.getPingsInterval);
    }

    componentDidUpdate(prevProps) {

    }

    column_onclick(column) {
        return () => {
            this.props.sort(column, false);
            this.props.initPings();
        };
    }

    renderItems() {
        let { data } = this.props.ping;

        return _.map(data, (item, key) => (
            <li key={key} onClick={() => { this.setState({ selectedId: null }); }} className={item.id === this.state.selectedId ? 'view-more-options-list view' : 'view'}>
                <ul>
                    <li><span className="status-label online"></span></li>
                    <li><strong>{item['location.name']}</strong></li>
                    <li><strong>{moment(item.requestDate).format('HH:mm DD.MM.YYYY')}</strong></li>
                    <li><strong>{moment(item.receivedDate).format('HH:mm DD.MM.YYYY')}</strong></li>
                    <li><strong>{`${item.delayMs} ms` || '-'}</strong></li>
                </ul>
            </li>
        ));
    }

    render() {
        let { data } = this.props.ping;

        return (
            <React.Fragment>
                <InfiniteScroll className="Ping swiper-slide"
                    hasMore={this.props.ping.total > this.props.ping.data.length}
                    isLoading={this.props.ping.isLoading}
                    onLoadMore={this.props.loadMore}>
                    <ConnectivityStats />
                    <div className="live-connectivity-status-list">
                        <ul className="table-ul">
                            <li className="view table-header">
                                <ul>
                                    <li></li>
                                    <li><strong>Location</strong></li>
                                    <li><strong>Request Date</strong></li>
                                    <li><strong>Received Date</strong></li>
                                    <li><strong>Access Time</strong></li>
                                </ul>
                            </li>
                            {this.renderItems()}
                        </ul>
                    </div>
                </InfiniteScroll>
                <LiveChart data={data} />
            </React.Fragment>
        );
    }
}

export default connect(state => {
    return {
        ping: state.ping,
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        session: state.session,
        startDate: state.ui.startDate,
    };
}, dispatch => {
    return {
        initPings: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();

                let result = await api.ping.all(state.ping.sortColumn);

                dispatch({ type: 'PING/ALL', payload: result });
            });
        },
        loadMore: () => {

        },
    };
})(Pings);