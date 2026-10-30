import React from 'react';

import './FormSuccess.scss';

interface Props {
    message: string;
}

export const FormSuccess = ({ message }: Props) => {
    if (message) {
        return (
            <div className="FormSuccess">
                <p>{message}</p>
            </div>
        );
    }
    return null;
};
