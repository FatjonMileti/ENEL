import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { browserHistory } from 'react-router';
import { loadReCaptcha, ReCaptcha } from 'react-recaptcha-google';

import pageService from 'services/page';
import { login, logout } from 'store/auth/actions';
import { hasSidebar } from 'store/ui/actions';
import { isInvalidLogin } from 'store/exceptions/selectors';

import { Form, Text } from 'components/form';
import { Button } from 'components/Button';

import './Login.scss';

class Login extends Component {
    state = {
        code: '',
        error: '',
    };

    recaptcha = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        loadReCaptcha();
        this.props.hasSidebar(false);
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    isValid() {
        return !this.props.isInvalidLogin && !this.state.error;
    }

    async handleLoginClick(e) {
        e.preventDefault();
        const { username, password, pin } = this.formApi.getState().values;
        const { code } = this.state;

        this.setState({ error: this.state.code ? '' : 'Please check reCAPTCHA box' }, async () => {
            this.setState({ loginClicked: true });
            await this.props.login(username, password, code, pin);
            if (pin) {
                if (this.isValid()) {
                    browserHistory.push('/');
                }
            }
        });
    }

    handleRecaptchaLoad() {
        if (this.recaptcha.current) {
            this.recaptcha.current.reset();
        }
    }

    handleRecaptchaToken(token) {
        this.setState({ code: token });
    }

    renderLoginError() {
        if (this.state.error) {
            return <div className="error-msg">{this.state.error}</div>;
        }

        if (this.props.isInvalidLogin) {
            return <div className="error-msg">Incorrect username or password</div>;
        }
    }

    handleResetPass() {
        browserHistory.push(pageService.links.resetPassword);
    }

    render() {
        const pinCls = this.state.loginClicked ? '' : 'hidden';
        const loginCls = !this.state.loginClicked ? '' : 'hidden';

        return (
            <div className="Login wrapper login-page view-login-form">
                <div className="login-form">
                    <Form getApi={this.setFormApi}>
                        {this.renderLoginError()}
                        <fieldset>
                            <div className="box-logo">
                                <img src="img/PPC_logo_positive.svg" alt="" />
                            </div>
                            <h3>TeleSales</h3>
                            <div className="input-wrapper">
                                <div className="row">
                                    <Text
                                        className="col-md-12"
                                        label="username"
                                        name="username"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="row">
                                    <Text
                                        className="col-md-12"
                                        label="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <ReCaptcha
                                            ref={this.recaptcha}
                                            size="normal"
                                            data-theme="dark"
                                            render="explicit"
                                            sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
                                            onloadCallback={this.handleRecaptchaLoad}
                                            verifyCallback={this.handleRecaptchaToken}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <Text
                                        className={`col-md-12 ${pinCls}`}
                                        label="Pin"
                                        name="pin"
                                    />
                                </div>
                            </div>
                            <Button
                                primary
                                value="Login"
                                id="login-btn"
                                className={loginCls}
                                onClick={this.handleLoginClick}
                                disablePrevent
                            />
                            <Button
                                primary
                                className={pinCls}
                                value="Confirm"
                                id="confirm-btn"
                                onClick={this.handleLoginClick}
                                disablePrevent
                            />

                            <Button
                                primary
                                id="reset-btn"
                                underline
                                value="Ai uitat parola?"
                                onClick={this.handleResetPass}
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
    login,
    logout,
    hasSidebar,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
