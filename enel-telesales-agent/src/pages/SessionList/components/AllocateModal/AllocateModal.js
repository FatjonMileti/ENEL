import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './AllocateModal.scss';
import { Form, Select } from 'components/form';

class AllocateModal extends Component {
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
        const agentId = this.formApi.getValue('agent');

        this.hide();
        if (this.props.onConfirm) {
            this.props.onConfirm(e, agentId);
        }
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    renderForm() {
        return (
            <Form autoComplete="off" getApi={this.setFormApi}>
                <div className="row">
                    <Select
                        className="offset-md-3 col-md-6"
                        label="Agent"
                        name="agent"
                        options={this.props.agents}
                        highlight
                        autocomplete
                    />
                </div>
            </Form>
        );
    }

    render() {
        return (
            <DropModal
                className="AllocateModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Realocā agent</div>
                    <div className="data-panel">{this.renderForm()}</div>
                    <Button primary value="Realocā" onClick={this.handleConfirmClick} />
                    <Button primary underline value="Anuleazā" onClick={this.handleDismissClick} />
                </div>
            </DropModal>
        );
    }
}

export default AllocateModal;
