import React from 'react';
import './Section.scss';

const Section = ({ title, children, step, isCurrent, show, className }) =>
    show ? (
        <div
            className={`Section ${isCurrent ? 'active' : ''} ${
                className ? className : ''
            }`}
            data-step={step}
        >
            <div className="section-title">{title}</div>
            <div className="section-content">{children}</div>
            {!isCurrent && <div className="section-overlay" />}
        </div>
    ) : null;

export default Section;
