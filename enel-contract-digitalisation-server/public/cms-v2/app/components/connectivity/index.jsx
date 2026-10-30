import React, { Fragment } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';

import Locations from './locationPage.jsx';
import Pings from './pingPage.jsx';
import Security from '../partials/security.jsx';
import Errors from '../partials/errors.jsx';
import Sidebar from './sidebar.jsx';

import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import api from '../../api/index.js';

import toastr from 'toastr';
import StatusChartModal from './components/statusChartModal';

class Connectivity extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            index: 0
        };
        this.swiper = null;

        this.tab_onclick = this.tab_onclick.bind(this);
    }

    tab_onclick(index) {
        return () => {
            if (!this.swiper)
                return;

            this.setState({
                index: index
            });
            this.swiper.slideTo(index);
        };
    }

    handleLocationStatusClick(location) {
        this.refs.statusChartModal.showModal(location);
        this.props.getStats(location.id);
    }

    render() {
        return ([
            <div className="content" key={0}>
                <div className="content-box content-box-with-tabs">
                    <div className="content-box-header">
                        <h3>Connectivity Network Status</h3>
                        <a onClick={this.props.export_onclick} className="button black" href="#" title=""><i className="icon-wlc-download-arrow"></i>Download Report</a>
                    </div>
                    <div className="content-box-body">
                        <Swiper {...{
                            containerClass: 'content-box-body-slider',
                            slidesPerView: 1,
                            spaceBetween: 0,
                            keyboardControl: true,
                            onInit: swiper => {
                                window.swiper = swiper;
                                this.swiper = swiper;
                            },
                            onSlideChangeStart: (swiper) => {
                                this.setState({ index: swiper.activeIndex });
                            }
                        }}>
                            {this.props.isAdmin ?
                                <Fragment>
                                    <Locations
                                        onStatusClick={this.handleLocationStatusClick}
                                    />
                                    <Pings />
                                </Fragment>
                                :
                                <Pings />
                            }
                        </Swiper>

                        <div className="tabs">
                            {this.props.isAdmin ? <span className={this.state.index === 0 ? 'selected' : ''} onClick={this.tab_onclick(0)}>Locations</span> : null}
                            <span className={this.state.index === 1 || !this.props.isAdmin ? 'selected' : ''} onClick={this.tab_onclick(1)}>Live Events</span>
                        </div>
                    </div>
                </div>
            </div>,
            <Sidebar key={1} />,
            <StatusChartModal
                key={2}
                ref="statusChartModal"
                data={this.props.delayStats}
            />
        ]);
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        delayStats: state.ping.delay.averageByLocation,
    };

}, dispatch => {
    return {
        export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forPing(state);
                let url = `${window.location.origin}/cms/proxy/ping-excel?$sort[receivedDate]=-1`;
                for (const filter of filters) {
                    url += `&${filter.column}=${filter.value}`;
                }
                window.open(url);
            });
        },
        getStats: (locationId) => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const result = await api.ping.stats(locationId, 'day', state.ui.startDate, state.ui.endDate);

                dispatch({ type: 'PING/STATS', payload: result });
            });
        }
    };
})(Connectivity);

