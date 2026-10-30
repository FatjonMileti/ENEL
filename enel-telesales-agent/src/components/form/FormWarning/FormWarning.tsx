import React from 'react';

import './FormWarning.scss';

interface Props {
    message: string;
}

export const FormWarning = ({ message }: Props) => {
    if (message) {
        return (
            <div className="FormWarning">
                <p>{message}</p>
            </div>
        );
    }
    return null;
};
