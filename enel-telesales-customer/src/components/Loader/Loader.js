import React from 'react';

import './Loader.scss';

const Loader = ({ show, title }) => {
    const renderTitle = () => {
        if (title) {
            return <div className="title">{title}</div>;
        }
    };

    return (
        <div className={`Loader transition-3s ${show ? 'show' : ''}`}>
            {renderTitle()}
            <span className="spinner">
                <svg className="circular" viewBox="25 25 50 50">
                    <circle
                        className="path"
                        cx="50"
                        cy="50"
                        r="20"
                        fill="none"
                        strokeMiterlimit="10"
                    />
                </svg>
            </span>
        </div>
    );
};

export default Loader;
