import React from 'react';
import './Button.scss';

interface Props {
    onClick: (e: MouseEvent) => void;
    value: string;
    className?: string;
    primary?: boolean;
    secondary?: boolean;
    outlined?: boolean;
    info?: boolean;
    light?: boolean;
    outline?: boolean;
    underline?: boolean;
    fullWidth?: boolean;
    hasIcon?: boolean;
    anchor?: boolean;
    disabled?: boolean;
    disablePrevent?: boolean;
}

export const Button = ({
    value,
    primary,
    secondary,
    outlined,
    info,
    light,
    outline,
    underline,
    fullWidth,
    hasIcon,
    onClick,
    className,
    disablePrevent,
    anchor,
    disabled,
    ...props
}: Props) => {
    const getClasses = () => {
        let classes = '';
        if (primary) {
            classes = 'btn-primary';
        }
        if (secondary) {
            classes = 'btn-secondary';
        }
        if (outlined) {
            classes = 'btn-outlined';
        }
        if (light) {
            classes = 'btn-light';
        }
        if (info) {
            classes = 'btn-info';
        }
        if (outline) {
            classes += '-outline';
        } else if (underline) {
            classes += '-underline';
        }
        if (fullWidth) {
            classes += ' btn-full-width';
        }
        if (hasIcon) {
            classes += ' btn-has-icon';
        }
        if (className) {
            classes += ` ${className}`;
        }
        if (disabled) {
            classes += ' btn-disabled';
        }
        return classes;
    };

    const handleClick = e => {
        if (!disablePrevent) {
            e.preventDefault();
        }
        if (onClick) {
            onClick(e);
        }
    };

    if (anchor) {
        return (
            <a
                className={`Button ${getClasses()}`}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            >
                {value}
            </a>
        );
    }

    return (
        <button value={value} className={`Button ${getClasses()}`} onClick={handleClick} {...props}>
            {value}
        </button>
    );
};
