import React from 'react';
import { connect } from 'react-redux';

import api from '../../api/user.js';

import moment from 'moment';

class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.export_full_onclick = this.export_full_onclick.bind(this);
        this.export_onclick = this.export_onclick.bind(this);
    }
    componentDidMount() {
    }

    async export_full_onclick(e) {
        e.preventDefault();

        const { monthlyScans } = this.props.ocr;
        if (monthlyScans.length === 0)
            return null;

        const since = monthlyScans.slice(-1)[0].date;
        const until = monthlyScans[0].date;

        window.open(`${window.location.origin}/cms/proxy/excel?createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}&$sort[createdAt]=-1`);
    }

    export_onclick(since, until) {
        return (e) => {
            e.preventDefault();
            since = moment(since, 'DD MMM YYYY');
            until = moment(until, 'DD MMM YYYY');

            window.open(`${window.location.origin}/cms/proxy/excel?createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}&$sort[createdAt]=-1`);
        };
    }

    render() {
        const { monthlyScans, maxScans, packageSize } = this.props.ocr;
        return (
            <div className="flex-sidebar">
                <div className="flex-sidebar-header">
                    <h3>Billing History</h3>
                    <a className="link-btn" href="#" title="" onClick={this.export_full_onclick}><i className="icon-wlc-download-arrow"></i>Download Full Report</a>
                </div>
                <div className="scrollbar">
                    <ul className="sidebar-list">
                        {
                            monthlyScans.map((month, i) => {
                                if (i === 0) //skip current month
                                    return null;
                                const sum = month.value;
                                const since = month.date.format('DD MMM YYYY');
                                const until = moment(month.date).add(1, 'month').format('DD MMM YYYY');
                                let noPackages = 0;
                                if (sum > maxScans) {
                                    const overflow = sum - maxScans;
                                    noPackages = Math.ceil(overflow / packageSize);
                                }
                                return (
                                    <li key={i}>
                                        <div className="sl-header">
                                            <h3>{since} - {until}</h3>
                                        </div>
                                        <div className="sl-body">
                                            <p>Total scans: <strong>{sum.toLocaleString()}</strong></p>
                                            <p>Suplimentary packages: <strong>{noPackages.toLocaleString()}</strong></p>
                                            <div className="sl-actions">
                                                <a className="button grey" href="#" title="" onClick={this.export_onclick(since, until)}><i className="icon-wlc-download-arrow"></i>Download Report</a>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
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
})(Sidebar);