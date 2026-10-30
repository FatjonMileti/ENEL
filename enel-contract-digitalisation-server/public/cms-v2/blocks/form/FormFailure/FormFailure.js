import React from 'react';

const FormFailure = ({ message }) => {
    if (message) {
        return (
            <div className="FormFailure">
                <p>{message}</p>
            </div>
        );
    }
    return null;
};

export default FormFailure;
