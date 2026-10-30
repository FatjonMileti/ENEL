import React from 'react';
import './Section.scss';

const Section = ({ className, children }) => (
    <div className={`Section ${className}`}>{children}</div>
);

export default Section;
