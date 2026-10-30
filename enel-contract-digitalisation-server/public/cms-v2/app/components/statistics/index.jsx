import React from 'react';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';
import moment from 'moment';


import api from '../../api/index.js';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';

import SidebarContainerOverview from '../overview/sidebarContainerOverview.jsx';
import Barchart from '../charts/barchart.jsx';

import _ from 'lodash';

import { 
    getStatusFilters,
    ACTIVATED,
    PENDING,
    ERRORED,
} from '../../helpers/filters.js';

class Statistics extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0
        };
        this.swiper = null;
        this.handleTabClick = this.handleTabClick.bind(this);
    }

    componentDidMount() {
        this.props.loadStats();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.loadStats();

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.loadStats();
                break;
            }
        }
    }

    handleTabClick(index) {
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
            <div className="content" key={3}>
                <div className="content-box content-box-with-tabs">
                    <div className="content-box-header">
                        <h3>Statistics</h3>
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
                            <Barchart
                                title="Contracts"
                                data={this.props.stats ? this.props.stats.day : []} 
                            />
                            <Barchart
                                title="Contracts"
                                data={this.props.stats ? this.props.stats.week : []}
                            />
                            <Barchart
                                title="Contracts"
                                data={this.props.stats ? this.props.stats.month: []}
                            />
                        </Swiper>

                        <div className="tabs">
                            <span className={this.state.index === 0 ? 'selected' : ''} onClick={this.handleTabClick(0)}>DAY</span>
                            <span className={this.state.index === 1 ? 'selected' : ''} onClick={this.handleTabClick(1)}>WEEK</span>
                            <span className={this.state.index === 2 ? 'selected' : ''} onClick={this.handleTabClick(2)}>MONTH</span>
                        </div>
                    </div>
                </div>
            </div>,
            <SidebarContainerOverview key={4} />
        ]);
    }
}

export default connect(state => {
    return {
        router: state.router,
        stats: state.session.count.detailed,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters,
    };
}, dispatch => {
    return {
        loadStats: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);

                const day = await Promise.all([
                    api.session.countGrouped('stats.day', null, filters.concat(getStatusFilters(ACTIVATED))),
                    api.session.countGrouped('stats.day', null, filters.concat(getStatusFilters(PENDING))),
                    api.session.countGrouped('stats.day', null, filters.concat(getStatusFilters(ERRORED))),
                ]);
                const week = await Promise.all([
                    api.session.countGrouped('stats.week', null, filters.concat(getStatusFilters(ACTIVATED))),
                    api.session.countGrouped('stats.week', null, filters.concat(getStatusFilters(PENDING))),
                    api.session.countGrouped('stats.week', null, filters.concat(getStatusFilters(ERRORED))),
                ]);
                const month = await Promise.all([
                    api.session.countGrouped('stats.month', null, filters.concat(getStatusFilters(ACTIVATED))),
                    api.session.countGrouped('stats.month', null, filters.concat(getStatusFilters(PENDING))),
                    api.session.countGrouped('stats.month', null, filters.concat(getStatusFilters(ERRORED))),
                ]);

                const labels = {
                    day: _.uniq(_.map(day[0].concat(day[1], day[2]), item => item.day)),
                    week: _.uniq(_.map(week[0].concat(week[1], week[2]), item => item.week)),
                    month: _.uniq(_.map(month[0].concat(month[1], month[2]), item => item.month)),
                };

                day[0] = _.keyBy(day[0], item => item.day);
                day[1] = _.keyBy(day[1], item => item.day);
                day[2] = _.keyBy(day[2], item => item.day);
                week[0] = _.keyBy(week[0], item => item.week);
                week[1] = _.keyBy(week[1], item => item.week);
                week[2] = _.keyBy(week[2], item => item.week);
                month[0] = _.keyBy(month[0], item => item.month);
                month[1] = _.keyBy(month[1], item => item.month);
                month[2] = _.keyBy(month[2], item => item.month);

                const data = {
                    day: _.map(labels.day, key => ({
                        activated: day[0][key] ? parseInt(day[0][key].count) : 0,
                        pending: day[1][key] ? parseInt(day[1][key].count) : 0,
                        errored: day[2][key] ? parseInt(day[2][key].count) : 0,
                        label: moment(key).format('DD MMM'),
                        key,
                    })),
                    week: _.map(labels.week, key => ({
                        activated: week[0][key] ? parseInt(week[0][key].count) : 0,
                        pending: week[1][key] ? parseInt(week[1][key].count) : 0,
                        errored: week[2][key] ? parseInt(week[2][key].count) : 0,
                        label: moment(key).format('DD MMM'),
                        key,
                    })),
                    month: _.map(labels.month, key => ({
                        activated: month[0][key] ? parseInt(month[0][key].count) : 0,
                        pending: month[1][key] ? parseInt(month[1][key].count) : 0,
                        errored: month[2][key] ? parseInt(month[2][key].count) : 0,
                        label: moment(key).format('MMM'),
                        key,
                    })),
                };

                data.day = _.sortBy(data.day, item => item.key);
                data.week = _.sortBy(data.week, item => item.key);
                data.month = _.sortBy(data.month, item => item.key);

                dispatch({ type: 'SESSION/COUNT/DETAILED', payload: data });
            });
        }
    };
})(Statistics);