import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import DropModal from 'reboron/DropModal';

import './MultiPlacesModal.scss';

class MultiPlacesModal extends Component {
    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    show() {
        this.modal.current.show();
    }

    hide() {
        this.modal.current.hide();
    }

    handleShow() {
        const { onShow } = this.props;
        disableBodyScroll(this.modal.current);
        if (onShow) {
            onShow();
        }
    }

    handleHide() {
        const { onHide } = this.props;
        enableBodyScroll(this.modal.current);
        if (onHide) {
            onHide();
        }
    }

    handleConfirmClick(e) {
        e.preventDefault();
        this.hide();
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    render() {
        return (
            <DropModal
                className="MultiPlacesModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="row">
                    <div className="col-md-12 close-modal-button-aligment">
                        <button type="button" onClick={this.hide} className="close-modal">
                            x
                        </button>
                    </div>
                </div>
                <div className="modal-overlay">
                    <div className="title">{this.props.title}</div>
                </div>
            </DropModal>
        );
    }
}

export default MultiPlacesModal;
