import React from 'react';
import _ from 'lodash';
import autoBind from 'react-autobind';

export default class Calendar extends React.Component {
    state = {
        focus: false,
        year: this.props.monthDisplay.format('YYYY'),
    };

    constructor(props) {
        super(props);
        autoBind(this);

        this.renderCalendarHeader = this.renderCalendarHeader.bind(this);
        this.renderCalendarDate = this.renderCalendarDate.bind(this);
        this.generateMonth = this.generateMonth.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.monthDisplay) {
            this.setState({
                year: nextProps.monthDisplay.format('YYYY'),
            });
        }
    }

    renderCalendarHeader() {
        return (
            <div className="picker-calendar-controls">
                <p className="picker-calendar-header-prev clickable icon-chevron-left" onClick={this.props.goToPrevMonth} />
                <div className="picker-calendar-header-month">
                    {this.props.monthDisplay.format('MMMM')}
                    <span className="year-label">
                        <p className="picker-calendar-header-prev picker-calendar-year-control clickable icon-chevron-down" onClick={this.props.goToPrevYear} />
                        {this.renderYear()}
                        <p className="picker-calendar-header-prev picker-calendar-year-control clickable icon-chevron-up" onClick={this.props.goToNextYear} />
                    </span>
                </div>
                <p className="picker-calendar-header-prev clickable icon-chevron-right" onClick={this.props.goToNextMonth} />
            </div>
        );
    }

    focusYear() {
        this.setState({
            focus: true,
        }, () => {
            this.input.focus();
        });
    }

    blurYear() {
        this.setState({
            focus: false,
        });
    }

    updateYear(e) {
        if (e.target.value.toString().length <= 4) {
            this.setState({
                year: e.target.value,
            });

            if (parseInt(e.target.value) > 1900) {
                this.props.goToYear(e.target.value);
            }
        }
    }

    renderYear() {
        if (this.state.focus) {
            return (
                <input
                    id="year_calendar"
                    ref={(c) => { this.input = c; }}
                    type="number"
                    value={this.state.year}
                    maxLength="4"
                    onBlur={this.blurYear}
                    onChange={this.updateYear}
                />
            );
        }
        return (
            <span onClick={this.focusYear} id="year_calendar_text">
                {this.props.monthDisplay.format('YYYY')}
            </span>
        );
    }

    renderDaysOfTheWeek() {
        return (
            <div className="picker-calendar-week-days">
                <div key={_.uniqueId()}>Sun</div>
                <div key={_.uniqueId()}>Mon</div>
                <div key={_.uniqueId()}>Tue</div>
                <div key={_.uniqueId()}>Wed</div>
                <div key={_.uniqueId()}>Thu</div>
                <div key={_.uniqueId()}>Fri</div>
                <div key={_.uniqueId()}>Sat</div>
            </div>
        );
    }

    renderCalendarDate(date) {
        if (date) {
            const highlight = (this.props.highlight && this.props.selectedDate.toDateString() === date.toDateString()) ? 'picker-calendar-days clickable today' : 'picker-calendar-days clickable';

            return (<div className={highlight} onClick={this.props.selectDate.bind(null, date)} key={_.uniqueId()}>{date.getDate()}</div>);
        }

        return (<div className="picker-calendar-days-empty" disabled key={_.uniqueId()}>&nbsp;</div>);
    }

    renderCalendarContent() {
        const calendar = this.calendar();

        return (
            <div className="picker-calendar-weeks-wrapper">
                <div id="calendar-wrapper">
                    {calendar.map(dates => (
                        <div className="picker-calendar-weeks" key={_.uniqueId()}>
                            {dates.map(date => this.renderCalendarDate(date))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    initializeCalendar() {
        const calendar = new Array(6);
        let index = 0;

        while (index < calendar.length) {
            calendar[index] = [null, null, null, null, null, null, null];

            index++;
        }

        return calendar;
    }

    generateMonth(calendar, day, date) {
        calendar.forEach((week, row) => {
            let position = 0;

            while (position <= 6 && date.getMonth() === this.props.month) {
                if (date.getDay() === position) {
                    calendar[row][position] = date;
                    day++;

                    date = new Date(this.props.year, this.props.month, day);

                    if ((position + 1) >= 6) {
                        position = 0;
                    }
                }

                position++;
            }
        });

        return calendar;
    }

    calendar() {
        const calendar = this.initializeCalendar();
        const day = 1;
        const date = new Date(this.props.year, this.props.month, day);

        return this.generateMonth(calendar, day, date);
    }

    render() {
        return (
            <div className="picker-calendar">
                <div className="picker-calendar-header">
                    {this.renderCalendarHeader()}
                    {this.renderDaysOfTheWeek()}
                </div>
                {this.renderCalendarContent()}
            </div>
        );
    }
}
