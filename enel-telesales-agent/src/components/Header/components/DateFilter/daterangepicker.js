import React from 'react';
import moment from 'moment';

const jquery = window.jQuery;

window.moment = moment;

class DateRangePicker extends React.Component {
    daterangepicker = React.createRef();

    componentDidMount() {
        let presetRanges = this.props.presetRanges;
        presetRanges.push({
            text: 'Lifetime',
            dateStart: () => moment(this.props.lifetimeStartDate),
            dateEnd: () => moment(),
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
            onChange: (event, ui) => this.onChange(event, ui),
        });

        if (this.props.startDate && this.props.endDate) {
            $daterangepicker.daterangepicker('setRange', {
                start: this.props.startDate.toDate(),
                end: this.props.endDate.toDate(),
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.isOpen !== this.props.isOpen;
    }

    componentDidUpdate() {
        if (this.props.isOpen) {
            jquery(this.daterangepicker.current).daterangepicker('open');
        } else {
            jquery(this.daterangepicker.current).daterangepicker('close');
        }
    }

    componentWillUnmount() {
        jquery(this.daterangepicker.current).daterangepicker('destroy');
    }

    onOpen() {
        this.props.onOpen();
    }

    onClose(event, ui) {
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
        return <input type="text" ref={this.daterangepicker} style={{ display: 'none' }} />;
    }
}

DateRangePicker.defaultProps = {
    enable: true,
    presetRanges: [
        {
            text: 'Today',
            dateStart: function() {
                return moment();
            },
            dateEnd: function() {
                return moment();
            },
        },
        {
            text: 'Current week',
            dateStart: function() {
                return moment().day(1);
            },
            dateEnd: function() {
                return moment().day(7);
            },
        },
        {
            text: 'Last 7 days',
            dateStart: function() {
                return moment().subtract('days', 6);
            },
            dateEnd: function() {
                return moment();
            },
        },
        {
            text: 'Current month',
            dateStart: function() {
                return moment().startOf('month');
            },
            dateEnd: function() {
                return moment().endOf('month');
            },
        },
        {
            text: 'Last 30 days',
            dateStart: function() {
                return moment().subtract('days', 29);
            },
            dateEnd: function() {
                return moment();
            },
        },
        {
            text: 'Current year',
            dateStart: function() {
                return moment().startOf('year');
            },
            dateEnd: function() {
                return moment().endOf('year');
            },
        },
        {
            text: 'Last year',
            dateStart: function() {
                return moment()
                    .subtract(1, 'year')
                    .startOf('year');
            },
            dateEnd: function() {
                return moment()
                    .subtract(1, 'year')
                    .endOf('year');
            },
        },
    ],
    dateFormat: 'dd.mm.yy',
    applyButtonText: 'Apply',
    clearButtonText: 'Clear',
    cancelButtonText: 'Cancel',
    lifetimeStartDate: '20170101',
    isOpen: false,
    startDate: undefined,
    endDate: undefined,
    onOpen: () => {},
    onClose: () => {},
    onChange: (start, end) => {},
};

export default DateRangePicker;
