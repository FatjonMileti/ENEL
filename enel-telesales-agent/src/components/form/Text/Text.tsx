import React, { useState } from 'react';
import { Text as TextInput, useFormApi } from 'informed';
import moment from 'moment';

import { DatePicker } from 'components/DatePicker';
import { TimePicker } from 'components/TimePicker';

import './Text.scss';

interface Props {
    name: string;
    className: string;
    label: string;
    field: string;
    onFormApi: (object) => void;
    onClick: (object) => void;
    onFocus: (object) => void;
    onChange: (object) => void;
    type: string;
    children: any;
    highlight: boolean;
    upperCase: boolean;
    disabled: boolean;
    display: boolean;
    dateFormat: string;
    timeFormat: string;
    defaultValue: string;
    optionsTimeStep: any;
    required: boolean;
}

export const Text = ({
    className,
    label,
    field,
    onFormApi,
    onClick,
    onChange,
    type,
    children,
    highlight,
    display,
    dateFormat,
    timeFormat,
    defaultValue,
    upperCase,
    optionsTimeStep,
    ...props
}: Props) => {
    let [filled, setFilled] = useState(false);
    let [isOpen, setIsOpen] = useState(false);
    // let [value, setValue] = useState('');
    const formApi = useFormApi();
    if (onFormApi) {
        onFormApi(formApi);
    }

    dateFormat = dateFormat || 'DD.MM.YYYY';
    timeFormat = timeFormat || 'HH:mm';

    let isDate = false;
    let date = moment();

    if (type === 'date') {
        isDate = true;
        type = 'text';
        props.onFocus = e => {
            if (!isOpen) {
                setIsOpen(true);
            }
            e.target.blur();
        };

        let value: string = formApi.getValue(props.name);
        if (value) {
            if (moment(value).isValid()) {
                value = moment(value).format(dateFormat);
                date = moment(value);
            }
        }
    }

    let isTime = false;
    // let time = moment();

    if (type === 'time') {
        isTime = true;
        type = 'text';
        props.onFocus = e => {
            if (!isOpen) {
                setIsOpen(true);
            }
            e.target.blur();
        };

        let value: string = formApi.getValue(props.name);
        if (value) {
            if (moment(value).isValid()) {
                value = moment(value).format(dateFormat);
                // time = moment(value);
            }
        }
    }

    const error = formApi.getError(props.name);
    const toUpperCase = v => (v && v.toUpperCase ? v.toUpperCase() : v);
    const mask = v => {
        // setTimeout(() => setValue(v), 100);
        setFilled(!!v || v === false);
        return upperCase ? toUpperCase(v) : v;
    };
    const datePicker = (
        <DatePicker
            className="DatePicker"
            isOpen={isOpen}
            selectedDate={date.toDate()}
            handleClosePicker={() => setIsOpen(false)}
            handleSelectDate={date => {
                formApi.setValue(props.name, moment(date).format(dateFormat));
                if (onChange) onChange({ target: { value: moment(date).format(dateFormat) } });
            }}
        />
    );

    const timePicker = (
        <TimePicker
            className="col-md-12"
            type={type}
            defaultValue={defaultValue}
            optionsTimeStep={optionsTimeStep}
            handleSelectDate={time => {
                formApi.setValue(props.name, moment(time).format(timeFormat));
                if (onChange) onChange({ target: { value: moment(time).format(timeFormat) } });
            }}
        />
    );

    return (
        <div
            className={`Text ${props.disabled ? 'disabled' : ''} ${display ? 'display' : ''} ${
                error ? 'has-error' : ''
            }  ${highlight ? 'highlight' : ''} ${className || ''}`}
            onClick={onClick}
        >
            {isDate && datePicker}
            {isTime && timePicker}
            <TextInput
                field={props.name}
                mask={mask}
                className={filled ? 'filled' : ''}
                required={props.required || false}
                validateOnChange={formApi.getState().submits > 0}
                onChange={e => {
                    if (onChange) {
                        e.target.value = mask ? mask(e.target.value) : e.target.value;
                        onChange(e);
                    }
                }}
                disabled={type === 'date'}
                type={type}
                {...props}
            />
            <span className="bar" />
            {error ? <span className="error-message">{error}</span> : null}
            {children}
            {label ? <label htmlFor={props.name}>{label}</label> : null}
        </div>
    );
};
