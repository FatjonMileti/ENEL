import React from 'react';
// TODO Remove library and replace with vanilla js
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import moment from 'moment';
import { Calendar } from './Calendar';
import './DatePicker.scss';

interface Props {
    isOpen: boolean;
    handleSelectDate: (value: Date) => void;
    handleClosePicker: () => void;
    initialMonth?: number;
    initialYear?: number;
    selectedDate?: Date;
    highlightSelected?: boolean;
    animationClose?: string;
    animationOpen?: string;
    animationNext?: string;
    animationPrev?: string;
    className: string;
}

interface State {
    month: number;
    year: number;
    selectedDate: Date;
    isOpen: boolean;
}

function getDefaultProps(): Partial<Props> {
    return {
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
}

export class DatePicker extends React.Component<Props, State> {
    constructor(props) {
        props = { ...getDefaultProps(), ...props };
        super(props);

        this.state = {
            month: props.selectedDate.getMonth(),
            year: props.selectedDate.getFullYear(),
            selectedDate: props.selectedDate,
            isOpen: props.isOpen,
        };
    }

    public componentDidUpdate(prevProps): void {
        if (!prevProps.isOpen && this.props.isOpen) {
            disableBodyScroll();
        }
        if (prevProps.isOpen && !this.props.isOpen) {
            enableBodyScroll();
        }
    }

    public componentWillUnmount() {
        enableBodyScroll();
    }

    public render() {
        const backgroundClass = this.props.isOpen
            ? `picker-background magictime ${this.props.animationOpen}`
            : 'picker-background';

        return (
            <div className="DatePicker">
                {this.props.isOpen && (
                    <div
                        id="picker-background"
                        className={backgroundClass}
                        onClick={() => this.props.handleClosePicker()}
                    >
                        <div className="picker-wrapper">
                            <div
                                id="picker-modal"
                                className="picker-modal-wrapper"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="picker-options">
                                    <Calendar
                                        selectedDate={this.state.selectedDate}
                                        month={this.state.month}
                                        year={this.state.year}
                                        highlight={this.props.highlightSelected}
                                        monthDisplay={moment(
                                            new Date(this.state.year, this.state.month)
                                        )}
                                        goToNextMonth={() => this._handleNextMonth()}
                                        goToPrevMonth={() => this._handlePrevMonth()}
                                        goToNextYear={() =>
                                            this.setState({ year: this.state.year + 1 })
                                        }
                                        goToPrevYear={() =>
                                            this.setState({ year: this.state.year - 1 })
                                        }
                                        goToYear={year => this.setState({ year: Number(year) })}
                                        selectDate={e => this._handleSelectDate(e)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    private _handleSelectDate(selectedDate) {
        this.setState({ selectedDate });

        this.props.handleSelectDate(selectedDate);
        this.props.handleClosePicker();
    }

    private _handleNextMonth() {
        const wrapper = document.getElementById('calendar-wrapper');

        wrapper.className += `magictime ${this.props.animationNext}`;

        if (this.state.month === 11) {
            this.setState({ year: this.state.year + 1, month: 0 });
        } else {
            this.setState({ month: this.state.month + 1 });
        }

        wrapper.className = '';
    }

    private _handlePrevMonth() {
        const wrapper = document.getElementById('calendar-wrapper');

        wrapper.className += `magictime ${this.props.animationPrev}`;

        if (this.state.month === 0) {
            this.setState({ year: this.state.year - 1, month: 11 });
        } else {
            this.setState({ month: this.state.month - 1 });
        }

        wrapper.className = '';
    }
}
