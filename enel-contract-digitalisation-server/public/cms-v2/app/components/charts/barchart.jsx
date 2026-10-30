import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import autoBind from 'react-autobind';
import moment from 'moment';
import Swiper from 'swiper';

import _ from 'lodash';

import { Bar as BarChart } from 'react-chartjs-2';

class Barchart extends React.Component {

    state = {
        mounted: false,
        chartKey: Math.random().toString(),
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.setState({ mounted: true });
        window.addEventListener('resize', () => {
            this.setState({ chartKey: Math.random().toString() });
        });
    }
    

    handleExportClick(e) {
        e.preventDefault();
        this.props.onExport(this.props.data);
    }

    renderChart() {
        return (
            <BarChart
                data={{
                    labels: _.map(this.props.data, item => moment(item.key).format('DD.MM.YYYY')),
                    datasets: [
                    {
                        label: "Activated",
                        data: _.map(this.props.data, item => item.activated),
                        backgroundColor: '#165bf2',
                    },
                    {
                        label: "Pending for activation",
                        data: _.map(this.props.data, item => item.pending + item.activated),
                        backgroundColor: "#40b9e6",
                    },
                    {
                        label: "Cancelled",
                        data: _.map(this.props.data, item => item.errored + item.pending + item.activated),
                        backgroundColor: "#ff1065",
                    }]
                }}
                options={{
                    pointDot: false,
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    scales: {
                        xAxes: [{
                            stacked: true,
                        }],
                        yAxes: [{
                            ticks: {
                                callback: (value) => {
                                    if (Number.isInteger(value) && value >= 0) return value;
                                }
                            }
                        }]
                    }
                }}
                width={this.refs.chartWrapper.offsetWidth}
                height={this.refs.chartWrapper.offsetHeight}
                key={this.state.chartKey}
            />
        );
    }

    render() {
        return (
            <div className="swiper-slide">
                <div className="box mar0b">
                    <div className="box-header">
                        <h3>{this.props.title}</h3>
                        <a className="button black" href="#" onClick={this.handleExportClick}>
                            <i className="icon-wlc-download-arrow"></i>Download Report
                        </a>
                    </div>
                    <div className="connectivity-report-graph" ref="chartWrapper">
                        {this.state.mounted && this.renderChart()}
                    </div>
                    <div className="graph-legend">
                        <span><em className="bullet"></em>Activated</span>
                        <span><em className="bullet"></em>Pending for activation</span>
                        <span><em className="bullet"></em>Cancelled</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(() => {
    return {}
}, dispatch => {
    return {
        onExport: (data) => {
            dispatch(async (dispatch, getState) => {
                const startDate = getState().ui.startDate.format('DD.MM.YYYY');
                const endDate = getState().ui.endDate.subtract(1, 'day').format('DD.MM.YYYY');
                let url = `${window.location.origin}/cms/proxy/excel-charts?data=${encodeURI(JSON.stringify(data))}&startDate=${startDate}&endDate=${endDate}`;
                window.open(url);
            });
        },
    };
})(Barchart);