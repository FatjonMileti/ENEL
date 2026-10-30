import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import _ from 'lodash';
import atention from './attention.svg';

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
        return <h4>{title}</h4>;
    }

    renderErrors() {
        return _.map(this.props.errors, (error, key) => <p key={key}>{error}</p>);
    }

    render() {
        return (
            <div className="FormErrors">
                <div className="order-md-1 col-md-12">
                    <div className="general-errors">
                        <img src={`${ atention }`} alt="" style={{ width: '1.9rem', height: '2rem' }}/>
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
