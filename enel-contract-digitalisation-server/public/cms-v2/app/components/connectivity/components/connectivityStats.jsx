import React from 'react';
import autoBind from 'react-autobind';

import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import api from '../../../api/index.js';
import buildFiltersFromState from '../../../helpers/buildFiltersFromState.js';

class ConnectivityStats extends React.Component {
    state = {
        selectedId: null
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
    
    }

    render() {
        return (
            <div className="box">
                <ul className="connectivity-stats">
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Total locations</strong>
                                <span>{this.props.location.total}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>LIVE locations</strong>
                                <span>{this.props.location.online}</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="table">
                            <div className="table-cell">
                                <strong>Offline locations</strong>
                                <span>{this.props.location.offline}</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        )
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
    return {};
})(ConnectivityStats);