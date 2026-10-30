import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { isLoading } from 'store/ui/selectors';

import './LoadingOverlay.scss';
import _ from 'lodash';


const propTypes = {
    show: PropTypes.bool,
};

const defaultProps = {
    show: false,
};

class LoadingOverlay extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        document.body.ontouchmove = (e) => {
            if (this.props.show) {
                e.preventDefault();
                return false;
            }
        };
    }

    render() {
        return (
            <div className="LoadingOverlay">
                <div className={`overlay ${this.props.show ? 'show' : ''}`}>
                    <span className="spinner">
                        <svg className="circular" viewBox="25 25 50 50">
                            <circle
                                className="path"
                                cx="50"
                                cy="50"
                                r="20"
                                fill="none"
                                strokeMiterlimit="10"
                            />
                        </svg>
                    </span>
                </div>
            </div>
        );
    }
}

LoadingOverlay.propTypes = propTypes;
LoadingOverlay.defaultProps = defaultProps;

const mapStateToProps = state => ({
    show: isLoading(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LoadingOverlay);

