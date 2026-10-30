import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import moment from 'moment';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './ReminderModal.scss';
import { Text, Form } from 'components/form';

class ReminderModal extends Component {
    state = {
        status: null,
        selected: false,
        time: null,
    };

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
            const { lead } = this.props;
            this.setState({ status: lead.status }, () => {
                this.formApi.setValues({
                    expiry_date: lead.expiry_date
                        ? moment(lead.expiry_date).format('DD.MM.YYYY')
                        : '',
                });
            });
        }
    }

    handleStatusChange(e) {
        this.setState({ status: e.target.value }, () => {
            this.formApi.setValue('substatus', '');
        });
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

    handleTimePick(time) {
        this.setState(time);
    }

    handleConfirmClick(e) {
        e.preventDefault();

        this.setState({ selected: true }, () => {
            const { lead } = this.props;
            let actionDate = this.formApi.getValue('actionDate');
            let actionTime = this.formApi.getValue('actionTime');

            if (actionDate && actionTime) {
                actionDate = moment(actionDate, 'DD.MM.YYYY').format('YYYY-MM-DD');
                actionDate = moment(actionDate + ' ' + actionTime);
            }

            this.hide();
            if (this.props.onConfirm) {
                setTimeout(() => {
                    this.props.onConfirm(e, actionDate, lead);
                }, 500);
            }
        });
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    renderConfirmButton() {
        if (this.props.confirmLabel && this.formApi) {
            const { actionDate } = this.formApi.getState().values;
            const { actionTime } = this.formApi.getState().values;

            return (
                <Button
                    primary
                    value={this.props.confirmLabel}
                    onClick={this.handleConfirmClick}
                    disabled={_.isEmpty(actionDate) || _.isEmpty(actionTime)}
                />
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

    renderForm() {
        return (
            <Fragment>
                <Form autoComplete="off" getApi={this.setFormApi}>
                    <div className="row">
                        <div className="col-md-6 offset-md-3">
                            <div className="row">
                                <Text
                                    className="col-md-12"
                                    label="Data reminder"
                                    name="actionDate"
                                    type="date"
                                    onChange={() => this.setState({ reload: true })}
                                />
                                <Text
                                    className="col-md-12"
                                    label="Time reminder"
                                    name="actionTime"
                                    type="time"
                                    onChange={() => this.setState({ reload: true })}
                                />
                            </div>
                        </div>
                    </div>
                </Form>
            </Fragment>
        );
    }

    render() {
        return (
            <DropModal
                className="ReminderModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Add reminder</div>
                    <div className="data-panel">{this.renderForm()}</div>
                    {this.renderConfirmButton()}
                    {this.renderDismissButton()}
                </div>
            </DropModal>
        );
    }
}

export default ReminderModal;
