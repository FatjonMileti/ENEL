import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import moment from 'moment';
import DateRangePicker from './daterangepicker.js';
import { getDateFilters, hasDateFilters } from 'store/ui/selectors';
import { setDateFilters } from 'store/ui/actions';

import './DateFilter.scss';

class DateFilter extends Component {
    state = {
        show: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleDateClick() {
        this.setState({ show: !this.state.show });
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleChange(start, end) {
        const { setDateFilters, onChange } = this.props;
        setDateFilters({ start, end });
        if (onChange) onChange();
    }

    renderLabel() {
        const { start, end } = this.props.dateFilters;
        if (start && end) {
            if (
                start.format('DD.MM.YYYY') ===
                moment(end)
                    .subtract(1, 'day')
                    .format('DD.MM.YYYY')
            ) {
                return start.format('DD.MM.YYYY');
            }
            return `${start.format('DD.MM.YYYY')} - ${moment(end)
                .subtract(1, 'day')
                .format('DD.MM.YYYY')}`;
        }
        return 'Select Date';
    }

    render() {
        if (this.props.dateFilters) {
            const { start, end } = this.props.dateFilters;
            if (this.props.hasDateFilters) {
                return (
                    <div className="DateFilter">
                        <p
                            onClick={this.handleDateClick}
                            className={`hc-btn header trigger-calendar${
                                this.state.show ? ' selected' : ''
                            }`}
                        >
                            <i className="icon-wlc-calendar-2" />
                            {this.renderLabel()}
                        </p>
                        <div className="mainfilters transition-3s-in-out">
                            <DateRangePicker
                                isOpen={this.state.show}
                                onChange={this.handleChange}
                                onClose={this.handleClose}
                                startDate={start}
                                endDate={end}
                            />
                        </div>
                    </div>
                );
            }
        }

        return null;
    }
}

const mapStateToProps = state => ({
    dateFilters: getDateFilters(state),
    hasDateFilters: hasDateFilters(state),
});

const mapDispatchToProps = {
    setDateFilters,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DateFilter);
