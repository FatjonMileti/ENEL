import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import OverviewStatsComponent from './overviewStatsComponent'
import api from '../../../api/index.js';
import buildFiltersFromState from '../../../helpers/buildFiltersFromState.js';
import {
    getStatusFilters,
    STARTED,
    ACTIVATED,
    PENDING,
    REJECTED,
    ERRORED,
    UNFINISHED,
} from '../../../helpers/filters.js';

class OverviewStatsContainer extends React.Component {
    constructor(props) {
        super(props);
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

    getStats(value) {
        if (this.props.stats) {
            return this.props.stats[value];
        }

        return 0;
    }

    render() {
        return (
            <div>
                <OverviewStatsComponent
                    started= {this.getStats('started')}
                    activated={this.getStats('activated')}
                    pending={this.getStats('pending')}
                    rejected={this.getStats('rejected')}
                    unfinished={this.getStats('unfinished')}
                    errored={this.getStats('errored')}
                />
            </div>
        )
    }
}

export default connect(state => {
    return {
        router: state.router,
        stats: state.session.count,
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

                const [started, activated, pending, rejected, unfinished, errored] = await Promise.all([
                    STARTED, ACTIVATED, PENDING, REJECTED, UNFINISHED, ERRORED
                ].map(status => (
                    api.session.count(null, filters.concat(getStatusFilters(status)))
                )));

                dispatch({ type: 'SESSION/COUNT/STATUS', payload: { started, activated, pending, rejected, unfinished, errored } });
            });
        }
    };
})(OverviewStatsContainer);