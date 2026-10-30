import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

import { dataURLtoBlob } from 'utils';

import { getError } from 'store/client/selectors';
import { clearError } from 'store/client/actions';

import './ErrorAlert.scss';

const propTypes = {
    error: PropTypes.string,
    title: PropTypes.string,
    clearError: PropTypes.func.isRequired,
};

const defaultProps = {
    title: 'A apărut o eroare',
    error: '',
};

class ErrorAlert extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleClear(e) {
        e.preventDefault();
        this.props.clearError();
    }

    render() {
        return (
            <div className={`ErrorAlert transition-2s-in-out ${this.props.error && 'show'}`} onClick={this.handleClear}>
                <span className="error-symbol">!</span>
                <div className="title">{this.props.title}</div>
                <div className="message">
                    {this.props.error}
                    {this.props.error.toString().endsWith('in 24 de ore') ? '' : <span> Te rugăm <a href="#">reîncearcă</a>.</span>}
                </div>
            </div>
        );
    }
}

ErrorAlert.propTypes = propTypes;
ErrorAlert.defaultProps = defaultProps;

const mapStateToProps = state => ({
    error: getError(state),
});

const mapDispatchToProps = dispatch => ({
    clearError: () => dispatch(clearError()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorAlert);
