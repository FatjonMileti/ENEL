import React from 'react';
import { connect } from 'react-redux';

import InfiniteScroll from '../infiniteScroll.jsx';
import moment from 'moment';
import api from '../../api/index.js';

import downloader from '../../helpers/download.js';

class OCRPage extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
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
                            <div className="box">
                                <h3>OCR Monthly report and 500k mark notification</h3>
                                <p>When the mark of 500k scans is reached, send an automatic notification to the following email
                                addresses:</p>
                                <div className="autocomplete-tags">
                                    <span className="at-tag">
                                        <i className="icon-wlc-close"></i>email@email.com</span>
                                    <span className="at-tag">
                                        <i className="icon-wlc-close"></i>email@email.com</span>
                                    <input className="at-input" type="text" value="" placeholder="Enter email address" />
                                </div>

                                <button className="button blue">Set Notification</button>
                            </div>

                            <div className="box">
                                <h3>PPC Easy Door to Door</h3>
                                <p>Send security alerts to the following email addresses:</p>
                                <div className="autocomplete-tags">
                                    <input className="at-input" type="text" value="" placeholder="Enter email address" />
                                </div>

                                <button className="button blue">Set Notification</button>
                            </div>

                            <div className="box">
                                <h3>PPC Easy Offices</h3>
                                <p>Send security alerts to the following email addresses:</p>
                                <div className="autocomplete-tags">
                                    <span className="at-tag">
                                        <i className="icon-wlc-close"></i>email@email.com</span>
                                    <input className="at-input" type="text" value="" placeholder="Enter email address" />
                                </div>
                                <button className="button blue">Set Notification</button>
                            </div>

                            <div className="box">
                                <h3>PPC Fast Contract</h3>
                                <p>Send security alerts to the following email addresses:</p>
                                <div className="autocomplete-tags">
                                    <span className="at-tag">
                                        <i className="icon-wlc-close"></i>email@email.com</span>
                                    <input className="at-input" type="text" value="" placeholder="Enter email address" />
                                </div>
                                <button className="button blue">Set Notification</button>
                            </div>
                        </div>
                    </div>
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
})(OCRPage);