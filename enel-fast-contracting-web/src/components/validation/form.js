import React, { Component } from 'react';
import PropTypes from 'prop-types';
import form from './hocs/form';

class Form extends Component {
    static propTypes = {
        getValues: PropTypes.func.isRequired,
        validate: PropTypes.func.isRequired,
        validateAll: PropTypes.func.isRequired,
        showError: PropTypes.func.isRequired,
        hideError: PropTypes.func.isRequired,
        className: PropTypes.string,
        lightTheme: PropTypes.bool,
    };

    static defaultProps = {
        className: '',
        lightTheme: false,
    };

    render() {
        const {
            getValues, validate, validateAll, showError, hideError, className, lightTheme, ...props
        } = this.props;

        return (
            <form {...props} className={`${lightTheme ? 'light-theme ' : ''}${className}`} />
        );
    }
}

export default form(Form);
