import React from 'react';
import { connect } from 'react-redux';

import api from '../../api/user.js';

import Piechart from '../charts/piechart.jsx';

class Sidebar extends React.Component {
    componentDidMount() {
    }

    render() {
        return (
            <div className="flex-sidebar">
                <div className="flex-sidebar-header">
                    <h3>Alert History</h3>
                    <a className="link-btn" href="#" title="">
                        <i className="icon-wlc-download-arrow"></i>Download Full Report</a>
                </div>
                <div className="scrollbar">
                    <ul className="sidebar-list">
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="sl-header">
                                <h3>2018.05.22 - 14:21:20 UTC</h3>
                            </div>

                            <div className="sl-body">
                                <p>Alert details Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed </p>
                                <div className="sl-actions">
                                    <a className="button grey" href="#" title="">
                                        <i className="icon-wlc-download-arrow"></i>Download Report</a>
                                </div>
                            </div>
                        </li>
                    </ul>

                </div>

            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router
    };
}, dispatch => {
    return {

    };
})(Sidebar);