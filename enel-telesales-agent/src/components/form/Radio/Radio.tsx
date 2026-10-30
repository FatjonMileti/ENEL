import React, { ChangeEvent } from 'react';
import { Radio as RadioInput, RadioGroup } from 'informed';

import './Radio.scss';

export interface IRadioOption {
    value: boolean;
    label: string;
}

interface Props {
    name: string;
    options: IRadioOption[];
    onChange: (event: ChangeEvent) => void;
    className?: string;
    disabled?: boolean;
}

export const Radio = ({ className, name, options, onChange, ...props }: Props) => (
    <div className={`Radio ${className || ''} ${props.disabled ? 'disabled' : ''}`}>
        <RadioGroup field={name}>
            {options.map(option => (
                <label key={option.label}>
                    {option.label}
                    <RadioInput value={option.value} onChange={onChange} {...props} />
                    <span className="checkmark" />
                </label>
            ))}
        </RadioGroup>
    </div>
);
