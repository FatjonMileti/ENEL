import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import OverviewStatsComponent from '../../overview/components/overviewStatsComponent';
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
    BO_UNPROCESSED
} from '../../../helpers/filters.js';

class AgentStatsContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.loadStats(this.props.agentId);
    }

    componentDidUpdate(prevProps) {
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.loadStats(this.props.agentId);

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.loadStats(this.props.agentId);
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
                    started={this.getStats('started')}
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
        stats: state.agent.sessions.count,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters,
    };
}, dispatch => {
    return {
        loadStats: (agentId) => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                let filters = buildFiltersFromState.forSession(state);

                const [started, activated, pending, rejected, unfinished, errored] = await Promise.all([
                    STARTED, ACTIVATED, PENDING, REJECTED, UNFINISHED, ERRORED, BO_UNPROCESSED
                ].map(status => {
                    let sessionFilters = filters.concat(getStatusFilters(status));

                    if (agentId) {
                        sessionFilters = sessionFilters.concat({ column: 'agent_id', value: agentId })
                    }

                    return api.session.count(null, sessionFilters)
                }));

                dispatch({ type: 'AGENT/COUNT/STATUS', payload: { started, activated, pending, rejected, unfinished, errored } });
            });
        }
    };
})(AgentStatsContainer);
