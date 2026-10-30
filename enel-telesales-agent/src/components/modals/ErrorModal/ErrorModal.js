import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';
import { FormErrors } from 'components/form';

import './ErrorModal.scss';

class ErrorModal extends Component {
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
        if (this.props.onConfirm) {
            this.props.onConfirm(e);
        }
    }

    renderConfirmButton() {
        if (this.props.confirmLabel) {
            return (
                <Button primary value={this.props.confirmLabel} onClick={this.handleConfirmClick} />
            );
        }
    }

    renderCloseButton() {
        if (this.props.showCloseIcon) {
            return <i className="ion-md-close" onClick={() => this.hide()}></i>;
        }
    }

    render() {
        const { title, errors, className } = this.props;
        return (
            <DropModal
                className={`ErrorModal ${className ? className : ''}`}
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    {this.renderCloseButton()}
                    <div className="title">{title}</div>
                    <div className="description">
                        <FormErrors errors={errors} />
                    </div>
                    {this.renderConfirmButton()}
                </div>
            </DropModal>
        );
    }
}

export default ErrorModal;
