import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import _ from 'lodash';

import './ModalOverlay.scss';

const propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    noClose: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

const defaultProps = {
    show: false,
    noClose: false,
};

class ModalOverlay extends Component {

    state = {
        middle: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.show && this.props.show) {
            this.handleShow();
        } else if (prevProps.show && !this.props.show) {
            this.handleHide();
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    handleShow() {
        disableBodyScroll(this.overlay);
        this.setState({
            middle: this.wrapper.offsetHeight < window.innerHeight,
        });
    }

    handleHide() {
        enableBodyScroll(this.overlay);
    }

    render() {
        return (
            <div
                className={`ModalOverlay ${this.props.show && 'show'}`}
                ref={(c) => { this.overlay = c; }}
                onClick={this.props.onClose}
            >
                <div className={`wrapper ${this.state.middle && 'middle'}`} onClick={e => e.stopPropagation()} ref={(c) => { this.wrapper = c; }}>
                    {!this.props.noClose
                        && <i className="ion-close close" style={{width: '23px',
                            height: '23px'}} onClick={this.props.onClose}/>
                    }
                    {this.props.children}
                </div>
            </div>
        );
    }
}

ModalOverlay.propTypes = propTypes;
ModalOverlay.defaultProps = defaultProps;

export default ModalOverlay;
