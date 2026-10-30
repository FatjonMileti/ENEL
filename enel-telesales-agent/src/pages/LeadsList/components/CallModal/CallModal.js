import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import moment from 'moment';
import _ from 'lodash';

import { FormErrors } from 'components/form';
import DropModal from 'reboron/DropModal';
import { Button } from 'components/Button';

import './CallModal.scss';
import { Text, TextArea, Form, Select } from 'components/form';

import { LEAD_STATUS, STATUS_LABELS, SUBSTATUS_MAPPING, SUBSTATUS_LABELS } from 'services/lead';
import { mix, laterThanToday, earlierThanDays } from 'services/rules';
import { checkForm } from 'services/form';
import pageService from 'services/page';

const initialState = {
    isValid: true,
    status: null,
    expiryDateVisible: false,
};

class CallModal extends Component {
    state = initialState;

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
        setTimeout(() => {
            this.setState(initialState);
        }, 500);
    }

    isValid() {
        return this.state.isValid;
    }

    async validate() {
        await checkForm(this);
    }

    getStatusOptions() {
        return _.map(LEAD_STATUS, status => ({ value: status, label: STATUS_LABELS[status] }));
    }

    getSubstatusOptions() {
        const { status } = this.state;

        if (status && SUBSTATUS_MAPPING[status]) {
            return _.map(SUBSTATUS_MAPPING[status], substatus => ({
                value: substatus,
                label: SUBSTATUS_LABELS[substatus],
            }));
        }

        return [];
    }

    loadLeadDetails() {
        if (this.formApi) {
            const { lead } = this.props;
            this.setState({ status: lead.status }, () => {
                this.formApi.setValues({
                    status: lead.status,
                    substatus: lead.substatus,
                    callback_date: lead.callback_date
                        ? moment(lead.callback_date).format('DD.MM.YYYY')
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

    async handleConfirmClick(e) {
        e.preventDefault();

        await this.validate();

        if (this.isValid()) {
            this.setState({ selected: true }, () => {
                const { note, ...values } = { ...this.formApi.getState().values };
                const { lead } = this.props;

                if (values.callback_date) {
                    values.callback_date = moment(values.callback_date, 'DD.MM.YYYY').format(
                        'YYYY-MM-DD'
                    );
                }

                if (values.expiry_date) {
                    values.expiry_date = moment(values.expiry_date, 'DD.MM.YYYY').format(
                        'YYYY-MM-DD'
                    );
                    values.expiry_date_extended = true;
                }

                this.hide();
                if (this.props.onConfirm) {
                    setTimeout(() => {
                        this.props.onConfirm(e, note, values, lead);
                        this.setState(initialState);
                    }, 500);
                }
            });
        } else {
            if (e) pageService.scrollToError();
        }
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    handleValabilityExtension(e) {
        e.preventDefault();
        this.setState({ expiryDateVisible: true });
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

    renderNote({ agent, value, createdAt }) {
        if (!_.isEmpty(agent)) {
            return (
                <div className="note">
                    <div className="agent">{agent.marca}</div>
                    <div className="created">{moment(createdAt).format('DD.MM.YYYY')}</div>
                    <div className="value">{value}</div>
                </div>
            );
        }
    }

    renderNotes() {
        const { lead } = this.props;
        if (lead && lead.notes && lead.notes.length) {
            return (
                <div className="notes-wrapper">
                    {_.map(lead.notes, note => this.renderNote(note))}
                </div>
            );
        }

        return <div className="no-notes">Inca nu au fost adaugate notite pentru acest lead.</div>;
    }

    renderForm() {
        const { expiryDateVisible } = this.state;
        const { lead } = this.props;
        const expiry_date_extended = lead ? lead.expiry_date_extended : null;

        return (
            <Fragment>
                <Form autoComplete="off" getApi={this.setFormApi}>
                    <div className="row">
                        <div className="col-md-12">
                            {expiryDateVisible && expiry_date_extended && (
                                <FormErrors errors={['Data de expirare a fost deja extinsa.']} />
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="row">
                                <Select
                                    className="col-md-12"
                                    label="Status"
                                    name="status"
                                    options={this.getStatusOptions()}
                                    onChange={this.handleStatusChange}
                                />
                                <Select
                                    className="col-md-12"
                                    label="Substatus"
                                    name="substatus"
                                    options={this.getSubstatusOptions()}
                                />
                                <Text
                                    className="col-md-12"
                                    label="Data reluare convorbire"
                                    name="callback_date"
                                    type="date"
                                />
                                {!expiryDateVisible && (
                                    <Button
                                        secondary
                                        value="Extinde valabilitate"
                                        onClick={this.handleValabilityExtension}
                                    />
                                )}
                                {expiryDateVisible && !expiry_date_extended && (
                                    <Text
                                        className="col-md-12"
                                        label="Dată expirare"
                                        name="expiry_date"
                                        type="date"
                                        validate={mix(laterThanToday, earlierThanDays(7))}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="col-md-6">
                            {this.renderNotes()}
                            <TextArea className="" label="Notițā" name="note" />
                        </div>
                    </div>
                </Form>
            </Fragment>
        );
    }

    render() {
        return (
            <DropModal
                className="CallModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Call Lead</div>
                    <div className="data-panel">{this.renderForm()}</div>
                    {this.renderConfirmButton()}
                    {this.renderDismissButton()}
                </div>
            </DropModal>
        );
    }
}

export default CallModal;
