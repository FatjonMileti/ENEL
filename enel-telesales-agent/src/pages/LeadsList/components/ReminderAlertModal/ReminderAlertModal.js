import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './ReminderAlertModal.scss';

class ReminderAlertModal extends Component {
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
            this.props.onConfirm(e);
        }
    }

    renderConfirmButton() {
        return <Button primary value="Confirma" onClick={this.handleConfirmClick} />;
    }

    render() {
        const reminder = this.props.data;
        return (
            <DropModal
                className="ReminderAlertModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                {reminder && (
                    <div className="modal-overlay">
                        <div className="title">{`${reminder['lead.fullName']}`}</div>
                        <div className="description center">
                            Sub 15 minute pana la expirarea reminderului.
                        </div>
                        {this.renderConfirmButton()}
                    </div>
                )}
            </DropModal>
        );
    }
}

export default ReminderAlertModal;
