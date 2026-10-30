import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';
import { Text, Form } from 'components/form';

import './RejectModal.scss';

class RejectModal extends Component {
    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    setFormApi(formApi) {
        this.formApi = formApi;
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
            this.props.onConfirm(e, this.formApi.getValue('reason'));
        }
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
                className="RejectModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">
                        Esti sigur ca vrei sa marchezi contractul ca refuzat?
                    </div>
                    <div className="data-panel">
                        <Form autoComplete="off" getApi={this.setFormApi}>
                            <div className="row">
                                <Text
                                    className="col-md-8 offset-md-2"
                                    name="reason"
                                    label="Detalii"
                                />
                            </div>
                        </Form>
                    </div>
                    <Button primary value="Refuza contract" onClick={this.handleConfirmClick} />
                    <Button primary underline value="Anuleaza" onClick={this.handleDismissClick} />
                </div>
            </DropModal>
        );
    }
}

export default RejectModal;
