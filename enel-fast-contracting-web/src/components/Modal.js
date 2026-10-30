import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DropModal from 'reboron/DropModal';

const defaultProps = {
    title: '',
    className: '',
};

const propTypes = {
    title: PropTypes.any,
    children: PropTypes.any.isRequired,
    onClose: PropTypes.func,
    className: PropTypes.string,
    modalRef: PropTypes.func.isRequired,
};

class Modal extends Component {
    handleClose = (e) => {
        e.stopPropagation();
        this.ref.hide();

        if (this.props.onClose) {
            this.props.onClose();
        }
    };

    handleRef = (ref) => {
        this.ref = ref;
        this.props.modalRef(ref);
    };

    render() {
        return (
            <DropModal className={this.props.className} ref={this.handleRef}>
                <div className="overlay-header">
                    <h3>{ this.props.title }</h3>
                    <i
                        className="icon-wlc-close close-overlay"
                        onClick={this.handleClose}
                    />
                </div>
                <div className="overlay-body">
                    { this.props.children }
                </div>
            </DropModal>
        );
    }
}

Modal.defaultProps = defaultProps;
Modal.propTypes = propTypes;

export default Modal;
