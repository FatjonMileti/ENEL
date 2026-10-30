import React from 'react';

import './FormErrors.scss';

interface Props {
    errors: string[];
}

export const FormErrors = ({ errors }: Props) => {
    if (errors && errors.length) {
        return (
            <div className="FormErrors">
                {errors.map((error, idx) => (
                    <p key={idx}>{error}</p>
                ))}
            </div>
        );
    }

    return null;
};
