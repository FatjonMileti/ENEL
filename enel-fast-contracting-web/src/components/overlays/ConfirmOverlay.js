import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import _ from 'lodash';

import './ConfirmOverlay.scss';

const propTypes = {
    show: PropTypes.bool,
    big: PropTypes.bool,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    confirmLabel: PropTypes.string,
    dismissLabel: PropTypes.string,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onDismiss: PropTypes.func,
    onConfirm: PropTypes.func,
    noDismiss: PropTypes.bool,
    noConfirm: PropTypes.bool,
    noFixed: PropTypes.bool,
    noLogo: PropTypes.bool,
    onlyOkButton: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

const defaultProps = {
    show: false,
    big: false,
    description: '',
    confirmLabel: 'Ok',
    dismissLabel: 'Anulează',
    noDismiss: false,
    noConfirm: false,
    noFixed: false,
    noLogo: false,
    onlyOkButton: false,
    onConfirm: () => { },
    onDismiss: () => { },
    children: [],
};

class ConfirmOverlay extends Component {

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
    }

    handleHide() {
        enableBodyScroll(this.overlay);
    }

    render() {
        return (
            <div className={`ConfirmOverlay ${this.props.show && 'show'} ${this.props.big && 'big'} ${this.props.noFixed && 'no-fixed'} ${this.props.noLogo && 'no-logo'}`} ref={(c) => { this.overlay = c; }}>
                {!this.props.noLogo && <div className="logo">
                    <a href="#">
                        <img src="imgs/PPC_logo_negative.svg" />
                    </a>
                </div>}
                <div className="content">
                    <div className="title">{this.props.title}</div>
                    <div className="description" style={{ paddingRight: 0 }}>{this.props.description}</div>
                    {this.props.children}
                    <div className="buttons">
                        {!this.props.noConfirm && <button className="btn continua-button" onClick={this.props.onConfirm}>
                            {this.props.confirmLabel}
                        </button>}
                        {!this.props.onlyOkButton && !this.props.noDismiss && <button className="btn btn-outline-secondary" onClick={this.props.onDismiss}>
                            {this.props.dismissLabel}
                        </button>}

                    </div>
                </div>
            </div>
        );
    }
}

ConfirmOverlay.propTypes = propTypes;
ConfirmOverlay.defaultProps = defaultProps;

export default ConfirmOverlay;
