
import React from 'react';
import PropTypes from 'prop-types';
import { button } from 'react-validation';


const Button = ({ hasErrors, ...props }) => {
    const { loading } = props;

    delete props.loading;

    if (loading) {
        let { className } = props;
        className += ' Preloader';
        return (
            <button {...props} className={className} disabled={loading}>
                <span className="spinner">
                    <svg className="circular" viewBox="25 25 50 50">
                        <circle className="path" cx="50" cy="50" r="20" fill="none" strokeMiterlimit="10" />
                    </svg>
                </span>
            </button>
        );
    }
    return (
        <button {...props} />
    );
};

Button.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    hasErrors: PropTypes.bool,
    loading: PropTypes.bool,
};

Button.defaultProps = {
    className: '',
    disabled: false,
    hasErrors: false,
    loading: false,
};

Button.contextTypes = {
    hasErrors: PropTypes.bool,
};

export default button(Button);
