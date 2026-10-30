import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import InfiniteScroll from '../infiniteScroll.jsx';
import moment from 'moment';
import api from '../../api/index.js';
import _ from 'lodash';

import Alert from './components/alert.jsx';

class AlertsPage extends React.Component {

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.loadAlerts();
    }

    handleAlertSave(id, data) {
        this.props.updateAlert(id, data);
    }

    renderAlerts() {
        return _.map(this.props.alerts, item => (
            <Alert
                alert={item}
                onSave={this.handleAlertSave}
            />
        ));
    }

    render() {
        return (
            <div className="content">
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Alerts and Reports</h3>
                    </div>

                    <div className="content-box-body alerts-list">
                        <div className="scrollbar">
                            {this.renderAlerts()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        alerts: state.alerts.data,
    };
}, dispatch => {
    return {
        loadAlerts: () => {
            dispatch(async (dispatch, getState) => {
                const alerts = await api.alerts.all();
                dispatch({ type: 'ALERTS/ALL', payload: alerts });
            });
        },
        updateAlert: (id, data) => {
            dispatch(async (dispatch, getState) => {
                await api.alerts.update(id, data);
            });
        },
    };
})(AlertsPage);