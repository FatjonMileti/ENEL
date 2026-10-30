import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';

interface Props {
    monthDisplay: moment.Moment;
    selectedDate: Date;
    month: number;
    year: number;
    highlight: boolean;
    goToNextMonth: () => void;
    goToPrevMonth: () => void;
    goToNextYear: () => void;
    goToPrevYear: () => void;
    goToYear: (value: number) => void;
    selectDate: (value: Date) => void;
}

interface State {
    focus: boolean;
    year: string;
}

export class Calendar extends Component<Props, State> {
    public readonly state = {
        focus: false,
        year: this.props.monthDisplay.format('YYYY'),
    };

    public input: HTMLInputElement;

    public componentWillReceiveProps(nextProps) {
        if (nextProps.monthDisplay) {
            this.setState({ year: nextProps.monthDisplay.format('YYYY') });
        }
    }

    public render(): JSX.Element {
        let calendar = Array.from(Array(6).keys(), () => Array.from(Array(7).keys(), () => null));
        const day = 1;
        const date = new Date(this.props.year, this.props.month, day);

        calendar = this._populateMonth(calendar, day, date);

        return (
            <div className="picker-calendar">
                <div className="picker-calendar-header">
                    <div className="picker-calendar-controls">
                        <i
                            className="picker-calendar-header-icon clickable ion-ios-arrow-back"
                            onClick={this.props.goToPrevMonth}
                        />
                        <div className="picker-calendar-header-month">
                            {this.props.monthDisplay.format('MMMM')}
                            <span className="year-label">
                                <i
                                    className="picker-calendar-header-icon picker-calendar-year-control clickable ion-ios-arrow-down"
                                    onClick={this.props.goToPrevYear}
                                />
                                {this.state.focus ? (
                                    <input
                                        id="year_calendar"
                                        ref={e => (this.input = e)}
                                        type="number"
                                        value={this.state.year}
                                        maxLength={4}
                                        onBlur={() => this.setState({ focus: false })}
                                        onChange={e => this._onYearInput(e.target.value)}
                                    />
                                ) : (
                                    <span
                                        onClick={() =>
                                            this.setState({ focus: true }, () => {
                                                this.input.focus();
                                            })
                                        }
                                        id="year_calendar_text"
                                    >
                                        {this.props.monthDisplay.format('YYYY')}
                                    </span>
                                )}
                                <i
                                    className="picker-calendar-header-icon picker-calendar-year-control clickable ion-ios-arrow-up"
                                    onClick={this.props.goToNextYear}
                                />
                            </span>
                        </div>
                        <i
                            className="picker-calendar-header-icon clickable ion-ios-arrow-forward"
                            onClick={this.props.goToNextMonth}
                        />
                    </div>
                    <div className="picker-calendar-week-days">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                </div>
                <div className="picker-calendar-weeks-wrapper">
                    <div id="calendar-wrapper">
                        {calendar.map(dates => (
                            <div className="picker-calendar-weeks" key={_.uniqueId()}>
                                {dates.map((date: Date, idx: number) => {
                                    if (date) {
                                        const highlight =
                                            this.props.highlight &&
                                            this.props.selectedDate.toDateString() ===
                                                date.toDateString() &&
                                            'today';

                                        return (
                                            <div
                                                key={idx}
                                                className={`picker-calendar-days clickable ${highlight}`}
                                                onClick={() => this.props.selectDate(date)}
                                            >
                                                {date.getDate()}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={idx} className="picker-calendar-days-empty">
                                            &nbsp;
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    private _populateMonth(calendar: Date[][], day: number, date: Date): Date[][] {
        calendar.forEach((week, row) => {
            let position = 0;

            while (position <= 6 && date.getMonth() === this.props.month) {
                if (date.getDay() === position) {
                    calendar[row][position] = date;
                    day++;

                    date = new Date(this.props.year, this.props.month, day);

                    if (position + 1 >= 6) {
                        position = 0;
                    }
                }

                position++;
            }
        });

        return calendar;
    }

    private _onYearInput(year: string) {
        if (year.length <= 4) {
            this.setState({ year });

            if (Number(year) > 1900) {
                this.props.goToYear(Number(year));
            }
        }
    }
}
