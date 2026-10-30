import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { email, phone } from '../../../../helpers/utils';
import FormFailure from '../../../../../blocks/form/FormFailure';

import DropModal from 'reboron/DropModal';

const initialState = {
    form: {
        email: '',
        phone: '',
    },
    isEmailValid: true,
    isPhoneValid: true,
    isEmpty: false,
};

class WhitelistModal extends Component {

    state = {
        ...initialState,
    };

    modal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        if(this.props.item) {
            const init = {
                form: {
                    email:this.props.item.email,
                    phone:this.props.item.phone
                },
                ...initialState,
            }
            this.setState({...init});
        } else {
            this.setState({ ...initialState });
        }

    }
    componentDidUpdate(prevProps, prevState) {

        if((prevProps.item !== this.props.item) && this.props.item) {
            const init = {
                form: {
                    email:this.props.item.email,
                    phone:this.props.item.phone
                },
            }
            this.setState({...init});
        }
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
            this.setState({ isEmpty: true });
            return true;
        };
    }

    validateEmail() {
        if (email(this.state.form.email)) {
            this.setState({ isEmailValid: false });
            return false;
        } else {
            return true;
        }
    }

    validatePhone() {

        if (this.state.form.phone === '') return false;
        if (phone(this.state.form.phone)) {
            this.setState({ isPhoneValid: false });
            return false;
        } else {
            return true;
        }

    }


    handleConfirmClick(e) {
        if (this.isEmpty()) return;
        const isValid = this.validateEmail() && this.validatePhone();
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

    handleValueChange(e) {
        const form = {
            ...this.state.form
        }
        form[e.target.name] = e.target.value;
        this.setState({
            form,
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
                className="WhitelistModal"
                ref={this.modal}
                onShow={this.handleShow}
                onHide={this.handleHide}
            >
                <div className="modal-overlay">
                    <div className="title">Add to Whitelist</div>
                    <div className="data-panel">
                        {!this.state.isEmailValid && <FormFailure message="Invalid email." />}
                        {!this.state.isPhoneValid && <FormFailure message="Invalid phone number." />}
                        {this.state.isEmpty && <FormFailure message="Type and value are required." />}
                        <div className="content-box-body alerts-list">
                            <div className="box form">
                                <div className="form-row">
                                    <p className="input-box-field active">
                                        <label>Email</label>
                                        <input
                                            type="text"
                                            name="email"
                                            value={this.state.form.email}
                                            onChange={this.handleValueChange}
                                        />
                                    </p>
                                    <p className="input-box-field active">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={this.state.form.phone}
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

export default WhitelistModal;
