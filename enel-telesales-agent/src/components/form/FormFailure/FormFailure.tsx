import React from 'react';

import './FormFailure.scss';

interface Props {
    message: string;
}

export const FormFailure = ({ message }: Props) => {
    if (message) {
        return (
            <div className="FormFailure">
                <p>{message}</p>
            </div>
        );
    }
    return null;
};
