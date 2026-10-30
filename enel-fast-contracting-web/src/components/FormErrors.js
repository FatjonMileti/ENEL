import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { dataURLtoBlob } from 'utils';

import './FormErrors.scss';

const propTypes = {
    title: PropTypes.string,
    errors: PropTypes.array,
};

const defaultProps = {
    title: '',
    errors: [],
};

class FormErrors extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
    }

    renderTitle() {
        const title = this.props.title || 'Rezolvați următoarele erori pentru a continua:';
        return (
            <h4>{title}</h4>
        );
    }

    renderErrors() {
        return _.map(this.props.errors, (error, key) => (
            <p key={key}>{error}</p>
        ));
    }

    render() {
        return (
            <div className="FormErrors">
                <div className="order-md-1 col-md-12" style={{ paddingLeft: 0 }}>
                    <div className="general-errors">
                        <span className="error-symbol">!</span>
                        {this.renderTitle()}
                        {this.renderErrors()}
                    </div>
                </div>
            </div>
        );
    }
}

FormErrors.propTypes = propTypes;
FormErrors.defaultProps = defaultProps;

export default FormErrors;
