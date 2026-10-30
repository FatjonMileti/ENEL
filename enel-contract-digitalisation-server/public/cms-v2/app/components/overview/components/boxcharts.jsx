import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Swiper from 'swiper';

import Piechart from '../../charts/piechart.jsx';

class BoxCharts extends React.Component {

	state = {
		tab: 1,
	}

	constructor(props) {
		super(props);
	}

	selectTab = (tab) => {
		this.setState({
			tab
		});
	}

	componentDidMount () {
		this.pieGraphSlider = new Swiper('.pie-graph-slider', {
			slidesPerView: 1,
			spaceBetween: 0,
		});
	}

	getData() {
		const { tab } = this.state;
		let data;

		if (tab == 1) {
			data = this.props.data.today;
		} else if (tab == 2) {
			data = this.props.data.week;
		} else {
			data = this.props.data.month;
		}

		return [data.started || 0, data.activated || 0];
	}

	renderPiechart() {
		const data = this.getData();

		if (!data[0] && !data[1]) {
			return (
				<Piechart 
					x={50}
					y={50}
					key={data.toString()}
					outerRadius={50}
					innerRadius={20}
					colors={['#c2c2c2']}
				    data={[100]}
				/>
			);
		}

		return (
			<Piechart 
				x={50}
				y={50} 
				key={data.toString()}
				outerRadius={50}
				innerRadius={20}
				colors={this.props.colors}
			    data={data}
			/>
		);
	}

	render() {
		const { tab } = this.state;
		const todayTotal = this.props.total ? this.props.data.today.started + this.props.data.today.activated : null;
		const weekTotal = this.props.total ? this.props.data.week.started + this.props.data.week.activated : null;
		const monthTotal = this.props.total ? this.props.data.month.started + this.props.data.month.activated : null;
		const separator = this.props.total ? '+' : '/';
		const chartImage = this.props.green ? <img src="img/svg/pie-4.svg" alt="" /> : <img src="img/svg/pie-3.svg" alt="" />;
		return (
			<Fragment>
				<h3 className="flex-sidebar-title-2">{ this.props.title }</h3>
				<div className="box box-pad0">
					<ul className="overview-sidebar-stats">
						<li
							className={tab == 1 ? 'active' : ''}
							onClick={() => { this.selectTab(1); }}
						>
							<div className="os-row-header">
								<strong>Today</strong>
							</div>
							<div className="os-row">
								<strong>{ this.props.measurment }</strong>
								<span>
									{ todayTotal }
									<div className="tooltip">{ this.props.total }</div>
								</span>
								<div>
									<span style={{ color: this.props.colors[0] }}>
										{ this.props.data.today.started }
										<div className="tooltip">{ this.props.started }</div>
									</span>
									{ separator }
									<span style={{ color: this.props.colors[1] }}>
										{ this.props.data.today.activated}
										<div className="tooltip">{ this.props.activated }</div>
									</span>
								</div>
							</div>
						</li>
						<li
							className={tab == 2 ? 'active' : ''}
							onClick={() => { this.selectTab(2); }}
						>
							<div className="os-row-header">
								<strong>This week</strong>
							</div>
							<div className="os-row">
								<strong>{ this.props.measurment }</strong>
								<span>
									{ weekTotal }
									<div className="tooltip">{ this.props.total }</div>
								</span>
								<div>
									<span style={{ color: this.props.colors[0] }}>
										{ this.props.data.week.started }
										<div className="tooltip">{ this.props.started }</div>
									</span>
									{ separator }
									<span style={{ color: this.props.colors[1] }}>
										{ this.props.data.week.activated}
										<div className="tooltip">{ this.props.activated }</div>
									</span>
								</div>
							</div>
						</li>
						<li
							className={tab == 3 ? 'active' : ''}
							onClick={() => { this.selectTab(3); }}
						>
							<div className="os-row-header">
								<strong>This month</strong>
							</div>
							<div className="os-row">
								<strong>{ this.props.measurment }</strong>
								<span>
									{ monthTotal }
									<div className="tooltip">{ this.props.total }</div>
								</span>
								<div>
									<span style={{ color: this.props.colors[0] }}>
										{ this.props.data.month.started }
										<div className="tooltip">{ this.props.started }</div>
									</span>
									{ separator }
									<span style={{ color: this.props.colors[1] }}>
										{ this.props.data.month.activated}
										<div className="tooltip">{ this.props.activated }</div>
									</span>
								</div>
							</div>
						</li>
					</ul>
					<div className="pie-graph-slider">
						<div className="swiper-wrapper">
							<div className="swiper-slide">
								<div className="pie-graph">
									{this.renderPiechart()}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default connect(state => {
	return {
		router: state.router,
		ocr: state.ocr
	};
}, dispatch => {
	return {

	};
})(BoxCharts);