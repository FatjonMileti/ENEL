import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { email, phone } from '../../../../helpers/utils';
import FormFailure from '../../../../../blocks/form/FormFailure';

import DropModal from 'reboron/DropModal';

const initialState = {
        form: {
            type: '',
            value: '',
        },
        isEmailValid: true,
        isPhoneValid: true,
        isEmpty: false,
    };

class BlacklistModal extends Component {

    state = {
        ...initialState,
    };

    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.setState({ ...initialState });
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
        this.setState(initialState);
        if (onHide) {
            onHide();
        }
    }

    isEmpty() {
        const { type, value } = this.state.form;

        if (type === '' || value === '') {
            this.setState({isEmpty: true});
            return true;
        };
    }

    validateEmail() {
        const { type, value } = this.state.form;

        if (type === 'email') {
            if (email(value)) {
                this.setState({ isEmailValid: false });
                return false;
            } else {
                return true;
            }
        }
    }

    validatePhone() {
        const { type, value } = this.state.form;

        if (type === '' || value === '') return false;
        if (type === 'phone') {
            if (phone(value)) {
                this.setState({ isPhoneValid: false });
                return false;
            } else {
                return true;
            }
        }
    }

    validateEmailString() {
        const { type, value } = this.state.form;

        if (type === '' || value === '') return false;
        if (type === 'emailString') {
            if (typeof value !== 'string') {
                this.setState({ isEmailStringValid: false });
                return false;
            } else {
                return true;
            }
        }
    }

    handleConfirmClick(e) {
        if (this.isEmpty()) return;
        const isValid = !!this.validateEmail() || !!this.validatePhone() || this.validateEmailString();
        if (!isValid) return;
        
        e.preventDefault();
        this.hide();
        if (this.props.onConfirm) {
            this.props.onConfirm(e, this.state.form);
        };
    }

    handleDismissClick(e) {
        e.preventDefault();
        this.hide();
        if (this.props.onDismiss) {
            this.props.onDismiss(e);
        }
    }

    handleTypeChange(e) {
        this.setState({
            form: {
                type: e.target.value,
                value: '',
            },
            isEmailValid: true,
            isPhoneValid: true,
            isEmpty: false,
        });
    }

    handleValueChange(e) {
        this.setState({
            form: {
                ...this.state.form,
                value: e.target.value,
            },
            isEmailValid: true,
            isPhoneValid: true,
            isEmpty: false,
        });
    }

    renderConfirmButton() {
        if (this.props.confirmLabel) {
            return (
                <button className="Button btn-primary" value={this.props.confirmLabel} onClick={this.handleConfirmClick}>Confirm</button>                    
            );
        }
    }

    renderDismissButton() {
        if (this.props.dismissLabel) {
            return (
                <button className="Button btn-primary btn-primary-underline" value={this.props.dismissLabel} onClick={this.handleDismissClick}>Cancel</button> 

            );
        }
    }

    render() {
        return (
            <DropModal
                className="BlacklistModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Add to blacklist</div>
                    <div className="data-panel">
                        {!this.state.isEmailValid && <FormFailure message="Invalid email."/>}
                        {!this.state.isPhoneValid && <FormFailure message="Invalid phone number." />}
                        {this.state.isEmpty && <FormFailure message="Type and value are required." />}
                        <div className="content-box-body alerts-list">
                            <div className="box form">
                                <div className="form-row">
                                    <p className="input-box-field active">
                                        <label>Type</label>
                                        <select name="type" value={this.state.form.type} onChange={this.handleTypeChange}>
                                            <option value='none'>none</option>
                                            <option value='email'>email</option>
                                            <option value='phone'>phone</option>
                                            <option value='emailString'>email string</option>
                                        </select>
                                    </p>
                                    <p className="input-box-field active">
                                        <label>Value</label>
                                        <input
                                            type="text"
                                            name="value"
                                            value={this.state.form.value}
                                            onChange={this.handleValueChange}
                                        />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderConfirmButton()}
                    {this.renderDismissButton()}
                </div>
            </DropModal>
        );
    }
}

export default BlacklistModal;
