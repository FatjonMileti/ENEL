import React from 'react';
import PropTypes from 'prop-types';
import Calendar from './calendar';

import moment from 'moment';
import autoBind from 'react-autobind';

class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            month: props.initialMonth,
            year: props.initialYear,
            selectedDate: props.selectedDate,
            isOpen: props.isOpen,
        };
    }

    animationTimeout(id, className) {
        const wrapper = document.getElementById(id);
        wrapper.className = className;
    }

    handleSelectDate(date) {
        this.setState({
            selectedDate: date,
        });

        this.props.handleSelectDate(date);
        this.handleClosePicker();
    }

    handleYear(value) {
        this.setState({
            year: parseInt(value),
        });
    }

    handleNextYear() {
        this.setState({
            year: (this.state.year + 1),
        });
    }

    handlePrevYear() {
        this.setState({
            year: (this.state.year - 1),
        });
    }

    handleNextMonth() {
        const wrapper = document.getElementById('calendar-wrapper');

        wrapper.className += `magictime ${this.props.animationNext}`;

        if (this.state.month === 11) {
            this.setState({
                year: (this.state.year + 1),
                month: 0,
            });
        } else {
            this.setState({
                month: (this.state.month + 1),
            });
        }

        this.animationTimeout('calendar-wrapper', '');
    }

    handlePrevMonth() {
        const wrapper = document.getElementById('calendar-wrapper');

        wrapper.className += `magictime ${this.props.animationPrev}`;

        if (this.state.month === 0) {
            this.setState({
                year: (this.state.year - 1),
                month: 11,
            });
        } else {
            this.setState({
                month: (this.state.month - 1),
            });
        }

        this.animationTimeout('calendar-wrapper', '');
    }

    handleNextDays(days) {
        const currentDate = this.state.selectedDate;
        const futureDate = currentDate.getDate() + days;

        currentDate.setDate(futureDate);

        this.setState({
            selectedDate: currentDate,
        });
    }

    handleClosePicker() {
        this.props.handleClosePicker();
    }

    handlePickerClick(e) {
        e.stopPropagation();
    }

    renderModal() {
        const modalClass = 'picker-modal-wrapper';
        const backgroundClass = (this.props.isOpen) ? `picker-background magictime ${this.props.animationOpen}` : 'picker-background';

        if (this.props.isOpen) {
            return (
                <div id="picker-background" className={backgroundClass} onClick={this.handleClosePicker}>
                    <div className="picker-wrapper">
                        <div id="picker-modal" className={modalClass} onClick={this.handlePickerClick}>
                            <div className="picker-options">
                                <Calendar
                                    selectedDate={this.state.selectedDate}
                                    month={this.state.month}
                                    year={this.state.year}
                                    highlight={this.props.highlightSelected}
                                    monthDisplay={moment(new Date(this.state.year, this.state.month))}
                                    goToNextMonth={this.handleNextMonth}
                                    goToPrevMonth={this.handlePrevMonth}
                                    goToNextYear={this.handleNextYear}
                                    goToPrevYear={this.handlePrevYear}
                                    goToYear={this.handleYear}
                                    selectDate={this.handleSelectDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                {this.renderModal()}
            </div>
        );
    }
}

DatePicker.defaultProps = {
    isOpen: false,
    initialMonth: new Date().getMonth(),
    initialYear: new Date().getFullYear(),
    highlightSelected: true,
    selectedDate: new Date(),
    animationClose: 'magicOut',
    animationOpen: 'magicIn',
    animationNext: 'magicIn',
    animationPrev: 'magicIn',
};

DatePicker.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleSelectDate: PropTypes.func.isRequired,
    handleClosePicker: PropTypes.func.isRequired,
    initialMonth: PropTypes.number,
    initialYear: PropTypes.number,
    selectedDate: PropTypes.object,
    highlightSelected: PropTypes.bool,
    animationClose: PropTypes.string,
    animationOpen: PropTypes.string,
    animationNext: PropTypes.string,
    animationPrev: PropTypes.string,
};

export default DatePicker;
