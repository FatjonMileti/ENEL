import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './Loader.scss';

const propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
};

const defaultProps = {
    show: false,
    title: '',
};

class Loader extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
    }

    renderTitle() {
        if (this.props.title) {
            return <div className="title">{this.props.title}</div>;
        }
    }

    render() {
        return (
            <div className={`Loader transition-3s ${this.props.show ? 'show' : ''}`}>
                {this.renderTitle()}
                <span className="spinner">
                    <svg className="circular" viewBox="25 25 50 50">
                        <circle className="path" cx="50" cy="50" r="20" fill="none" strokeMiterlimit="10" />
                    </svg>
                </span>
            </div>
        );
    }
}

Loader.propTypes = propTypes;
Loader.defaultProps = defaultProps;

export default Loader;
