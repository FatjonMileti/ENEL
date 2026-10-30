import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './NoteModal.scss';
import { Form, TextArea } from 'components/form';

class NoteModal extends Component {
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

    loadLeadDetails() {
        if (this.formApi) {
            const { notes } = this.props.lead;
            this.formApi.setValues({
                notite: notes || '-',
            });
        }
        return null;
    }

    handleShow() {
        const { onShow } = this.props;
        disableBodyScroll(this.modal.current);
        this.loadLeadDetails();
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
            this.props.onConfirm(e, this.formApi.getValue('note'), this.props.lead);
        }
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    renderConfirmButton() {
        if (this.props.confirmLabel) {
            return (
                <Button primary value={this.props.confirmLabel} onClick={this.handleConfirmClick} />
            );
        }
    }

    renderDismissButton() {
        if (this.props.dismissLabel) {
            return (
                <Button
                    primary
                    underline
                    value={this.props.dismissLabel}
                    onClick={this.handleDismissClick}
                />
            );
        }
    }

    render() {
        return (
            <DropModal
                className="NoteModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Adauga Notita</div>
                    <div className="data-panel">
                        <Form autoComplete="off" getApi={this.setFormApi}>
                            <div className="row">
                                <TextArea className="col-md-12" label="Notițā" name="note" />
                            </div>
                        </Form>
                    </div>
                    {this.renderConfirmButton()}
                    {this.renderDismissButton()}
                </div>
            </DropModal>
        );
    }
}

export default NoteModal;
