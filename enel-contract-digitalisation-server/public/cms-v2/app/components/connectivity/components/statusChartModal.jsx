import React from 'react';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';

import api from '../../../api/index.js';
import buildFiltersFromState from '../../../helpers/buildFiltersFromState.js';

import DropModal from 'reboron/DropModal';
import { Line as LineChart } from 'react-chartjs-2';

class StatusChartModal extends React.Component {

    state = {
        location: null,
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.show && nextProps.show) {
            this.showModal();
        }
    }

    showModal(location) {
        this.refs.modal.show();
        this.setState({ location });
    }

    hideModal() {
        this.refs.modal.hide();
    }

    handleModalHide() {
        this.setState({ location: null });
    }

    renderName() {
        if (this.state.location) {
            return (
                <h3>
                    <span className={`status-label ${this.state.location.status}`}></span>{ this.state.location.name }
                </h3>
            );
        }
    }

    renderDetails() {
        if (this.state.location) {
            return (
                <p>
                    Last Check: {moment(this.state.location.lastPingAt).format('HH:mm DD.MM.YYYY')}
                    <span className="delimiter">|</span>
                    Last Access Time: {this.state.location.lastDelayMs ? `${this.state.location.lastDelayMs} ms` : '-'}
                    <span className="delimiter">|</span>
                    Average Access Time Today: {this.state.location.averageDelayToday ? `${this.state.location.averageDelayToday} ms` : '-'}
                </p>
            );
        }
    }

    renderChart() {

        return (
            <LineChart
                data={{
                    labels: this.state.location ? _.map(this.props.data[`_${this.state.location.id}`].byDay, (item, dayKey) => dayKey) : null,
                    datasets: [{
                        label: "Average Access Time",
                        data: this.state.location ? _.map(this.props.data[`_${this.state.location.id}`].byDay, item => item) : null,
                        backgroundColor: "#10ab5d",
                    },
                    ]
                }}
                options={{
                    pointDot: false,
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: (value) => {
                                    if (Number.isInteger(value) && value >= 0) return value;
                                },
                            },
                            stacked: true
                        }]
                    }
                }}
                width={770}
                height={410}
            />
        );
    }

    render() {
        return (
            <div className="StatusChartModal view-overlay-connectivity">
                <DropModal
                    className="modal overlay-connectivity"
                    ref="modal"
                    onHide={this.handleModalHide}>
                    <div className="overlay-content with-header">
                        <div className="overlay-header">
                            {this.renderName()}
                            <i
                                className="icon-wlc-close close-button-overlay"
                                onClick={this.hideModal}
                            />
                        </div>
                        <div className="connectivity-report-graph">
                            {this.renderChart()}
                        </div>
                        <div className="connectivity-footer">
                            <div className="table align-center">
                                <div className="table-cell">
                                    {this.renderDetails()}
                                </div>
                            </div>
                        </div>
                    </div>
                </DropModal>
            </div>
        )
    }
}

export default StatusChartModal;