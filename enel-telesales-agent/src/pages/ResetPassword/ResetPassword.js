import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import { resetPassword } from 'store/auth/actions';
import { hasSidebar } from 'store/ui/actions';
import { isInvalidLogin } from 'store/exceptions/selectors';

import { Form, Text } from 'components/form';
import { Button } from 'components/Button';

import './ResetPassword.scss';

class ResetPassword extends Component {
    state = {
        code: '',
        error: '',
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    renderResetError() {
        if (this.state.error) {
            return <div className="error-msg">{this.state.error}</div>;
        }

        if (this.props.isInvalidLogin) {
            return <div className="error-msg">Incorrect username or password</div>;
        }
    }

    async handleResetClick(e) {
        e.preventDefault();
        const { username, contact } = this.formApi.getState().values;
        await this.props.resetPassword(username, contact);
    }

    render() {
        return (
            <div className="Login wrapper login-page view-login-form">
                <div className="login-form">
                    <Form getApi={this.setFormApi}>
                        {this.renderResetError()}
                        <fieldset>
                            <div className="box-logo">
                                <img src="img/PPC_logo_positive.svg" alt="" />
                            </div>
                            <h3>Password reset</h3>
                            <div className="input-wrapper">
                                <div className="row">
                                    <Text className="col-md-12" label="username" name="username" />
                                </div>
                                <div className="row">
                                    <Text
                                        className="col-md-12"
                                        label="phone(last 3 digits)/email(exact address)"
                                        name="contact"
                                    />
                                </div>
                            </div>
                            <Button
                                primary
                                value="Reset"
                                id="reset-btn"
                                onClick={this.handleResetClick}
                                disablePrevent
                            />
                        </fieldset>
                    </Form>
                </div>
                <div className="copy">
                    <img src="img/fullscreendigital-logo.svg" alt="" />
                    <p>Designed &amp; Engineered by Fullscreen Digital</p>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isInvalidLogin: isInvalidLogin(state),
});

const mapDispatchToProps = {
    resetPassword,
    hasSidebar,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
