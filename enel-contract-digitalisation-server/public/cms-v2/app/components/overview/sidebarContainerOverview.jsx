import React from 'react';
import { connect } from 'react-redux';

import api from '../../api/index.js';
import moment from 'moment';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import SidebarAlertComponent from './components/sidebarAlertComponent';

import {
    getStatusFilters,
    STARTED,
    ACTIVATED,
    PENDING,
} from '../../helpers/filters.js';

import BoxCharts from './components/boxcharts';

class SidebarContainerOverview extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.loadStats();
    }

    componentDidUpdate(prevProps) {
        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.loadStats();
                break;
            }
        }
    }

    getStats(type) {
        if (this.props.stats && this.props.stats[type]) {
            return this.props.stats[type];
        }

        return {
            today: {
                started: 0,
                activated: 0,
            },
            week: {
                started: 0,
                activated: 0,
            },
            month: {
                started: 0,
                activated: 0,
            }
        }
    }

    render() {
        return (
            <div className="flex-sidebar no-fix-header">
                <div className="scrollbar">
                    <SidebarAlertComponent
                        totalPending={this.props.totalPending}
                    />
                    <ul className="sidebar-list">
                        <BoxCharts
                            title="Fast Contracting Overview"
                            measurment="Sessions"
                            started="Started sessions"
                            activated="Accepted contracts"
                            colors={['#000000', '#444444']}
                            data={this.getStats('web')}
                        />
                        <BoxCharts
                            title="PPC Easy Overview"
                            measurment="Sessions"
                            started="Started sessions"
                            activated="Accepted contracts"
                            colors={['#000000', '#444444']}
                            data={this.getStats('d2d')}
                        />
                    </ul>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        totalPending: state.session.count.totalPending,
        stats: state.session.count.byPeriod,
        filters: state.ui.filters,
    };
}, dispatch => {
    return {
        loadStats: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state, { date: false });

                const groups = {
                    today: { column: 'createdAt[$gte]', value: moment().startOf('day').format('YYYYMMDD') },
                    week: { column: 'createdAt[$gte]', value: moment().startOf('week').format('YYYYMMDD') },
                    month: { column: 'createdAt[$gte]', value: moment().startOf('month').format('YYYYMMDD') },
                };

                const totalPending = await api.session.count(null, filters.concat(getStatusFilters(PENDING)));
                dispatch({ type: 'SESSION/COUNT/TOTAL_PENDING', payload: totalPending });

                const web = await Promise.all([
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(STARTED), groups.today)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(ACTIVATED), groups.today)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(STARTED), groups.week)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(ACTIVATED), groups.week)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(STARTED), groups.month)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(ACTIVATED), groups.month)),
                ]);

                const d2d = await Promise.all([
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), groups.today)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), groups.today)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), groups.week)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), groups.week)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), groups.month)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), groups.month)),
                ]);

                const data = {
                    web: {
                        today: {
                            started: web[0],
                            activated: web[1],
                        },
                        week: {
                            started: web[2],
                            activated: web[3],
                        },
                        month: {
                            started: web[4],
                            activated: web[5],
                        }
                    },
                    d2d: {
                        today: {
                            started: d2d[0],
                            activated: d2d[1],
                        },
                        week: {
                            started: d2d[2],
                            activated: d2d[3],
                        },
                        month: {
                            started: d2d[4],
                            activated: d2d[5],
                        }
                    },
                }

                dispatch({ type: 'SESSION/COUNT/PERIOD', payload: data });
            });
        }
    };
})(SidebarContainerOverview);