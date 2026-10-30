import React from 'react';
import { connect } from 'react-redux';

import api from '../../api/user.js';

import Piechart from '../charts/piechart.jsx';

class Sidebar extends React.Component {
    componentDidMount() {
        this.props.initUsers();
    }

    render() {
        return (
            <div className="flex-sidebar no-fix-header">
                <div className="scrollbar">
                    <h3 className="flex-sidebar-title-2">Contracts Activity Overview</h3>
                    <div className="box">
                        <ul className="stats">
                            <li>
                                <strong>Total contracts today</strong>
                                <span>{this.props.counter.today}</span>
                            </li>
                            <li>
                                <strong>Total contracts this week</strong>
                                <span>{this.props.counter.week}</span>
                            </li>
                            <li>
                                <strong>Total contracts this month</strong>
                                <span>{this.props.counter.month}</span>
                            </li>
                        </ul>
                    </div>
                    <h3 className="flex-sidebar-title-2">Agents Activity Overview</h3>
                    <div className="box">
                        <div className="pie-graph">
                            <Piechart x={50} y={50} outerRadius={50} innerRadius={20} colors={['#FF0F64', '#0555FA', '#FF5A0F']}
                                data={[this.props.user.active, this.props.user.online, this.props.user.count - this.props.user.online]} />
                            {/* <img src="img/svg/pie.svg" alt="" /> */}
                        </div>
                        <ul className="stats pie-graph-stats">
                            <li>
                                <strong>Total contracts today</strong>
                                <span>{this.props.counter.today}</span>
                            </li>
                            <li>
                                <strong className="with-bullet">Total active agents</strong>
                                <span>{this.props.user.active}</span>
                            </li>
                            <li>
                                <strong className="with-bullet">Total online agents</strong>
                                <span>{this.props.user.online}</span>
                            </li>
                            <li>
                                <strong className="with-bullet">Total offline agents</strong>
                                <span>{this.props.user.count - this.props.user.online}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        counter: state.websession.count,
        user: state.user
    };
}, dispatch => {
    return {
        initUsers: () => {
            return dispatch(async (dispatch, getState) => {
                const count = await api.count();
                const online = await api.countOnline();
                const active = await api.countActive();

                dispatch({
                    type: 'INIT_USERS', payload: {
                        count,
                        online,
                        active
                    }
                });
            });
        }
    };
})(Sidebar);