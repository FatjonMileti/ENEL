// depends on
// jquery 2.1.0 from npm install
// css (include in html)
// daterangepicker.css jquery-ui.min.css jquery-ui.structure.min.css jquery-ui.theme.min.css
// js (manual require)
// jquery-ui.min.js daterangepicker.js

import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import jquery from 'jquery';
window.$ = window.jQuery = jquery;

window.moment = moment;
require('../../js/jquery-ui.min.js');
require('../../js/daterangepicker.js');

class DateRangePicker extends React.Component {
    constructor(props) {
        super(props);

        this.daterangepicker = React.createRef();
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.isOpen !== this.props.isOpen;
    }

    componentDidUpdate(prevProps) {
        if (this.props.isOpen) {
            jquery(this.daterangepicker.current).daterangepicker('open');
        } else {
            jquery(this.daterangepicker.current).daterangepicker('close');
        }
    }

    componentDidMount() {
        let presetRanges = this.props.presetRanges;
        presetRanges.push({
            text: 'Lifetime',
            dateStart: () => moment(this.props.lifetimeStartDate),
            dateEnd: () => moment()
        });

        const $daterangepicker = jquery(this.daterangepicker.current);

        $daterangepicker.daterangepicker({
            presetRanges: presetRanges,
            dateFormat: this.props.dateFormat,
            applyButtonText: this.props.applyButtonText,
            clearButtonText: this.props.clearButtonText,
            cancelButtonText: this.props.cancelButtonText,
            onOpen: (event, ui) => this.onOpen(event, ui),
            onClose: (event, ui) => this.onClose(event, ui),
            onChange: (event, ui) => this.onChange(event, ui)
        });

        if (this.props.startDate && this.props.endDate)
            $daterangepicker.daterangepicker('setRange', { start: this.props.startDate.toDate(), end: this.props.endDate.toDate() });
    }

    componentWillUnmount() {
        jquery(this.daterangepicker.current).daterangepicker('destroy');
    }

    onOpen() {
        this.props.onOpen();
    }
    onClose() {
        this.props.onClose();
    }
    onChange() {
        const $dateRangePicker = jquery(this.daterangepicker.current);
        const selectedRange = $dateRangePicker.daterangepicker('getRange');
        const start = moment(selectedRange['start']);
        const end = moment(selectedRange['end']).add(1, 'day');

        this.props.onChange(start, end);
    }

    render() {
        return (
            <input type="text" ref={this.daterangepicker} style={{ display: 'none' }} />
        );
    }
}

DateRangePicker.defaultProps = {
    enable: true,
    presetRanges: [
        { text: 'Today', dateStart: function () { return moment(); }, dateEnd: function () { return moment(); } },
        { text: 'Current week', dateStart: function () { return moment().day(1); }, dateEnd: function () { return moment().day(7); } },
        { text: 'Last 7 days', dateStart: function () { return moment().subtract('days', 6); }, dateEnd: function () { return moment(); } },
        { text: 'Current month', dateStart: function () { return moment().startOf('month'); }, dateEnd: function () { return moment().endOf('month'); } },
        { text: 'Last 30 days', dateStart: function () { return moment().subtract('days', 29); }, dateEnd: function () { return moment(); } },
        { text: 'Current year', dateStart: function () { return moment().startOf('year'); }, dateEnd: function () { return moment().endOf('year'); } },
        { text: 'Last year', dateStart: function () { return moment().subtract(1, "year").startOf('year'); }, dateEnd: function () { return moment().subtract(1, "year").endOf('year'); } },
    ],
    dateFormat: 'dd.mm.yy',
    applyButtonText: 'Apply',
    clearButtonText: 'Clear',
    cancelButtonText: 'Cancel',
    lifetimeStartDate: '20170101',
    isOpen: false,
    startDate: undefined,
    endDate: undefined,
    onOpen: () => { console.log('default onOpen()'); },
    onClose: () => { console.log('default onClose()'); },
    onChange: (start, end) => { console.log('default onChange()', start, end); }
};

export default DateRangePicker;