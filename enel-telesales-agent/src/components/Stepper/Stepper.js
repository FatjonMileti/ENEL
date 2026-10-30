import React from 'react';
import './Stepper.scss';
import _ from 'lodash';

// use this to enable stepper repositioning
// style={{ transform: `translate3d(0, -${40 * (current - 1)}px, 0)` }}
const Stepper = ({ total, current, onClick }) => (
    <div className="Stepper">
        <div className="vertical-line" />
        {_.range(1, total + 1).map(step => (
            <div
                key={`${step}`}
                className={`step-value ${step === current ? 'active' : ''}`}
                onClick={e => {
                    onClick(step);
                }}
            >
                {step}
            </div>
        ))}
    </div>
);

export default Stepper;
