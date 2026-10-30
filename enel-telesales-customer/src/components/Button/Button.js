import React from 'react';
import './Button.scss';

const Button = ({
    value,
    disabled,
    primary,
    secondary,
    light,
    outline,
    underline,
    className,
    ...props
}) => {
    const getClasses = () => {
        let classes = primary ? 'btn-primary' : 'btn-secondary';
        if (light) {
            classes = 'btn-light';
        }
        if (outline) {
            classes += '-outline';
        } else if (underline) {
            classes += '-underline';
        }
        return className ? `${classes} ${className}` : classes;
    };
    return !disabled ? (
        <button value={value} className={`Button ${getClasses()}`} {...props}>
            {value}
        </button>
    ) : null;
};

export default Button;
