import React from 'react';
import { Checkbox as CheckboxInput } from 'informed';

import './Checkbox.scss';

interface Props {
    label: string;
    name: string;
    onChange: () => void;
    onClick: () => void;
    className?: string;
    field?: string;
    checked?: boolean;
    display?: boolean;
    disabled?: boolean;
    black?: boolean;
}

export const Checkbox = ({
    className,
    label,
    name,
    field,
    onChange,
    onClick,
    checked,
    display,
    ...props
}: Props) => {
    const classNames = [
        'Checkbox',
        className,
        display && 'display',
        checked && 'checked',
        props.disabled && 'disabled',
        props.black && 'black',
    ].filter(Boolean);

    return (
        <div className={classNames.join(' ')} onClick={onClick}>
            <label>
                {label}
                {!display && <CheckboxInput field={name} onChange={onChange} {...props} />}
                <span className="checkmark" />
            </label>
        </div>
    );
};
