import React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import { history } from '../../store.js';
import _ from 'lodash';

import InfiniteScroll from '../infiniteScroll.jsx';
import ConnectivityStats from './components/connectivityStats.jsx';
import moment from 'moment';
import api from '../../api/index.js';

import toastr from 'toastr';

class Locations extends React.Component {

    state = {
        selectedId: null,
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.initLocations();
    }

    componentDidUpdate(prevProps) {
       
    }

    column_onclick(column) {
        return () => {
            this.props.sort(column, false);
            this.props.initLocations();
        };
    }

    async downloadRequest_onclick(e) {
        let id = this.state.selectedId;
        let details = await api.location.details(id);
        if (details.xml) {
            downloader(`location_${id}.xml`, 'text/xml', details.xml);
        } else {
            toastr.info('No request data available');
        }
    }

    handleStatusIconClick(location) {
        if (this.props.onStatusClick) this.props.onStatusClick(location);
    }

    renderItems() {
        return _.map(this.props.location.data, item => (
            <li key={item.id}>
                <ul>
                    <li><span className={`status-label ${item.status}`}></span></li>
                    <li><strong>{item.name}</strong></li>
                    <li><strong>{moment(item.lastPingAt).format('HH:mm DD.MM.YYYY')}</strong></li>
                    <li><strong>{item.lastDelayMs ? `${item.lastDelayMs} ms` : '-'}</strong></li>
                    <li><strong>{item.averageDelayWeek ? `${item.averageDelayWeek} ms` : '-'}</strong></li>
                </ul>
                <i
                    className="icon-wlc-graph square-btn-light trigger-connectivity-status-popup"
                    onClick={() => this.handleStatusIconClick(item)}
                />
            </li>
        ));
    }

    render() {
        return (
            <InfiniteScroll className="Location swiper-slide"
                hasMore={this.props.location.total > this.props.location.data.length}
                isLoading={this.props.location.isLoading}
                onLoadMore={this.props.loadMore}>
                <ConnectivityStats />
                <div className="box">
                    <ul className="table-ul connectivity-status-list">
                        <li className="table-ul-header">
                            <ul>
                                <li className='pointer'></li>
                                <li className='pointer'><strong>Location</strong></li>
                                <li className='pointer'><strong>Last Check</strong></li>
                                <li className='pointer'><strong>Last Access Time</strong></li>
                                <li className='pointer'><strong>Average Access Time Today</strong></li>
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
        location: state.location,
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        session: state.session,
        startDate: state.ui.startDate,
    };
}, dispatch => {
    return {
        initLocations: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const result = await api.location.all(
                    state.location.sortColumn || 'lastPingAt',
                    state.location.ascending,
                );

                dispatch({ type: 'LOCATION/ALL', payload: result });
            });
        },
        loadMore: () => {},
    };
})(Locations);