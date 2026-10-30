import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import './HeaderHero.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const RegistrationInfo = ({ className }) => {
    const registrationName = useSelector(state =>
        state.registration.registrationName
    );

    return (
        <div className={className}>Cerere: { registrationName }</div>
    );
};

RegistrationInfo.propTypes = propTypes;
RegistrationInfo.defaultProps = defaultProps;

export default RegistrationInfo;
