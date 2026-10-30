import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';
import { Text, Form } from 'components/form';

import './SendLinkModal.scss';

class SendLinkModal extends Component {
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

    loadContact() {
        if (this.formApi) {
            const { contact } = this.props;
            this.formApi.setValue('contact', contact);
        }
        return null;
    }

    handleShow() {
        const { onShow } = this.props;
        disableBodyScroll(this.modal.current);
        this.loadContact();
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
            this.props.onConfirm(e, this.formApi.getValue('contact'));
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
                className="SendLinkModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Confirmi trimiterea link-ului?</div>
                    <div className="data-panel">
                        <Form autoComplete="off" getApi={this.setFormApi}>
                            <div className="row">
                                <Text
                                    className="col-md-8 offset-md-2"
                                    name="contact"
                                    disabled={this.props.disableInput}
                                />
                            </div>
                        </Form>
                    </div>
                    <Button primary value="Trimite" onClick={this.handleConfirmClick} />
                    <Button primary underline value="Anuleaza" onClick={this.handleDismissClick} />
                </div>
            </DropModal>
        );
    }
}

export default SendLinkModal;
