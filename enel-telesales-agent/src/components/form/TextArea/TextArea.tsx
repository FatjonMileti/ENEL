import React, { useState } from 'react';
import { TextArea as TextAreaInput, useFormApi } from 'informed';
import './TextArea.scss';

interface Props {
    name: string;
    className: string;
    label: string;
    disabled: boolean;
    onChange: (object) => void;
    highlight: () => void;
    field: string;
    upperCase: boolean;
    children: any;
    display: boolean;
    onFormApi: (object) => void;
}

export const TextArea = ({
    className,
    label,
    name,
    field,
    disabled,
    display,
    highlight,
    upperCase,
    children,
    onChange,
    onFormApi,
    ...props
}: Props) => {
    let [filled, setFilled] = useState(false);
    // let [value, setValue] = useState('');
    const formApi = useFormApi();
    if (onFormApi) {
        onFormApi(formApi);
    }

    const error = formApi.getError(name);
    const toUpperCase = v => (v && v.toUpperCase ? v.toUpperCase() : v);
    const mask = v => {
        // setTimeout(() => setValue(v), 100);
        setFilled(!!v || v === false);
        return upperCase ? toUpperCase(v) : v;
    };

    return (
        <div
            className={`TextArea ${disabled ? 'disabled' : ''} ${display ? 'display' : ''} ${
                error ? 'has-error' : ''
            }  ${highlight ? 'highlight' : ''} ${className || ''}`}
        >
            <TextAreaInput
                field={name}
                mask={mask}
                className={filled ? 'filled' : ''}
                required
                validateOnChange={formApi.getState().submits > 0}
                //rows="2"
                onChange={e => {
                    if (onChange) {
                        e.target.value = mask ? mask(e.target.value) : e.target.value;
                        onChange(e);
                    }
                }}
                {...props}
            />
            <span className="bar" />
            {error ? <span className="error-message">{error}</span> : null}
            {children}
            {label ? <label htmlFor={name}>{label}</label> : null}
        </div>
    );
};
