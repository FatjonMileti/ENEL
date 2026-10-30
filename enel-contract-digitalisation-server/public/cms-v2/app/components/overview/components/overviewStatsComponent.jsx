import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

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

class OverviewStatsComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="box">
                <ul className="overview-stats">
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Started processes</strong>
                                <span>{this.props.started}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Approved for activation</strong>
                                <span>{this.props.activated}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Pending approval</strong>
                                <span>{this.props.pending}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Rejected by client</strong>
                                <span>{this.props.rejected}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Unfinished</strong>
                                <span>{this.props.unfinished}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Canceled or with error</strong>
                                <span>{this.props.errored}</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        )
    }
}

export default (OverviewStatsComponent);