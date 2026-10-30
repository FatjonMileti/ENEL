import React from 'react';
import ReactDOM from 'react-dom';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';

import api from '../../../api/index.js';
import buildFiltersFromState from '../../../helpers/buildFiltersFromState.js';

import DropModal from 'reboron/DropModal';
import { Line as LineChart } from 'react-chartjs-2';

class LiveChart extends React.Component {
	state = {
		height: 0,
		width: 0,
		left: 0,
	}

	constructor(props) {
		super(props);
		autoBind(this);
		this.graph = React.createRef();
	}

	componentDidMount() {
		this.calculateValues();
		window.addEventListener('resize', this.calculateValues);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.calculateValues);
	}

	calculateValues() {
		const box = window.getComputedStyle(ReactDOM.findDOMNode(this.graph.current).previousSibling);
		const width = parseFloat(box.getPropertyValue('width')) - 30;
		const graphBox = window.getComputedStyle(ReactDOM.findDOMNode(this.graph.current));
		const height = parseFloat(graphBox.getPropertyValue('height'));
		const parentBox = window.getComputedStyle(ReactDOM.findDOMNode(this.graph.current).parentNode);
		const left = parseFloat(parentBox.getPropertyValue("width")) + 20;

		this.setState({
			width,
			height,
			left
		})
	}

	showModal(location) {
		this.refs.modal.show();
		this.setState({ location });
	}

	render() {
		const { width, height, left } = this.state;
		return (
			<div
				ref={this.graph}
				className="live-connectivity-status-graph"
				style={{ width, left, paddingBottom: 20, background: "#f1f1f1" }}
			>
				<LineChart
					data={{
						labels: _.map(this.props.data, item => moment(item.receivedDate).format('HH:mm')),
						datasets: [{
							label: "Delay MS",
							data: _.map(this.props.data, item => item.delayMs),
							backgroundColor: "#10ab5d",
							pointRadius: 0,
							borderColor:  "#10ab5d",
						}]
					}}
					options={{
						layout: {
							padding: {
								left: -20,
								right: 0,
								top: 0,
								bottom: 0
							}
						},
						responsive: true,
						legend: {
							display: false,
						},
						scales: {
							yAxes: [{
								ticks: {
									display: false
								},
								gridLines: {
									drawBorder: false,
									display:false
								}
							}],
							xAxes: [{
								gridLines: {
									drawBorder: false,
									display:false
								}
							}]
						}
					}}
					width={width}
					height={height}
				/>
			</div>
		)
	}
}

export default LiveChart;