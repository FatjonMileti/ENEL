import React from 'react';

const FormSuccess = ({ message }) => {
    if (message) {
        return (
            <div className="FormSuccess">
                <p>{message}</p>
            </div>
        );
    }
    return null;
};

export default FormSuccess;
