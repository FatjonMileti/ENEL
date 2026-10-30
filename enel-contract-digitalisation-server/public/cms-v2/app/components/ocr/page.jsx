import React from 'react';
import { connect } from 'react-redux';

import InfiniteScroll from '../infiniteScroll.jsx';
import moment from 'moment';
import api from '../../api/index.js';

import downloader from '../../helpers/download.js';
import Piechart from '../charts/piechart.jsx';
import toastr from 'toastr';

class OCRPage extends React.Component {
    constructor(props) {
        super(props);

        this.export_onclick = this.export_onclick.bind(this);
    }

    componentDidMount() {
        this.props.initOCR();
    }

    async export_onclick(e) {
        e.preventDefault();

        const { invoiceDate, monthlyScans } = this.props.ocr;
        if (monthlyScans.length === 0)
            return null;

        const nextInvoiceDate = moment().startOf('month').date(invoiceDate.date());
        if (nextInvoiceDate.date() <= moment().date())
            nextInvoiceDate.add(1, 'month');


        const since = monthlyScans[0].date;
        const until = nextInvoiceDate;
        window.open(`${window.location.origin}/cms/proxy/excel?createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}&$sort[createdAt]=-1`);
    }

    render() {
        const { invoiceDate, maxScans, packageSize, monthlyScans } = this.props.ocr;
        const nextInvoiceDate = moment().startOf('month').date(invoiceDate.date());
        if (nextInvoiceDate.date() <= moment().date())
            nextInvoiceDate.add(1, 'month');

        if (monthlyScans.length === 0)
            return null;

        const currentMonth = monthlyScans[0];
        const daysUntilInvoicing = nextInvoiceDate.diff(moment().startOf('day'), 'days');
        let currentMonthScans = 0;
        let noPackages = 0;
        currentMonthScans = currentMonth.value;
        if (currentMonthScans > maxScans) {
            const overflow = currentMonthScans - maxScans;
            noPackages = Math.ceil(overflow / packageSize);
        }

        return (
            <div className="content">

                <div className="content-box">
                    <div className="content-box-header">
                        <h3>This Month's OCR Counter Status</h3>
                    </div>
                    <div className="content-box-body">
                        <div className="box box-top-img">
                            <div className="table">
                                <div className="table-cell">
                                    <h3><strong>{daysUntilInvoicing} {daysUntilInvoicing === 1 ? 'day' : 'days'}</strong> remaining until invoicing</h3><br />
                                    <h3><strong>{noPackages}</strong> additional packages consumed</h3>
                                </div>
                            </div>
                        </div>
                        <div className="box with-header mar0b">
                            <div className="box-header">
                                <h3>Scan Status for this Month</h3>
                                <a className="button black" href="#" title="" onClick={this.export_onclick}><i className="icon-wlc-download-arrow"></i>Download This Month's Report</a>
                            </div>
                            <div className="box-body">
                                <div className="scans-pie-graph">
                                    <Piechart x={50} y={50} outerRadius={50} innerRadius={20} colors={['#FF0F64', '#C6C6C6']}
                                        data={[currentMonthScans, maxScans - currentMonthScans]} />
                                    {/* <img src="img/svg/pie-2.svg" alt="" /> */}
                                </div>
                                <div className="table">
                                    <div className="table-cell">
                                        <ul className="stats pie-graph-stats">
                                            <li>
                                                <strong className="with-bullet">Scans this month</strong>
                                                <span>{currentMonthScans.toLocaleString()} <em>/ {maxScans.toLocaleString()}</em> </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
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
        router: state.router,
        ocr: state.ocr
    };
}, dispatch => {
    return {
        initOCR: () => dispatch(async (dispatch, getState) => {
            dispatch({ type: 'OCR_LOADING' });

            const { monthlyScans } = getState().ocr;
            let newMonthlyScans = [];

            for (const month of monthlyScans) {
                let sum = 0;
                const sessions = await api.session.countAllSince(month.date, moment(month.date).add(1, 'month'));
                for (const session of sessions.data) {
                    sum += session.ocr_count;
                }
                newMonthlyScans.push({ date: month.date, value: sum });
            }

            dispatch({ type: 'INIT_OCR', payload: newMonthlyScans });
        })
    };
})(OCRPage);