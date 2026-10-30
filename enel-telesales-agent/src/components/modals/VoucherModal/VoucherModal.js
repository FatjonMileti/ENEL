import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import moment from 'moment';
import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './VoucherModal.scss';

class VoucherModal extends Component {
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
        const { voucher, className } = this.props;
        return (
            <DropModal
                className={`VoucherModal ${className ? className : ''}`}
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    {this.renderCloseButton()}
                    <div className="description">
                        <div className="row">
                            <div className="col-md-3">
                                <b>Voucher Code:</b>
                            </div>
                            <div className="col-md-3">{voucher?.voucher_code}</div>
                        </div>
                        <div className="row">
                            <div className="col-md-3">
                                <b>Valabilitate:</b>
                            </div>
                            <div className="col-md-3">
                                {moment(voucher?.voucher_enddate).format('DD.MM.YYYY')}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-3">
                                <b>Status:</b>
                            </div>
                            <div className="col-md-3">{voucher?.voucher_status}</div>
                        </div>
                    </div>
                    {this.renderConfirmButton()}
                </div>
            </DropModal>
        );
    }
}

export default VoucherModal;
