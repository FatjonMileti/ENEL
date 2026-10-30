import React from 'react';

import './FormStatus.scss';

interface Props {
    message: string;
}

export const FormStatus = ({ message }: Props) => {
    if (message) {
        return (
            <div className="FormStatus">
                <p>{message}</p>
            </div>
        );
    }
    return null;
};
