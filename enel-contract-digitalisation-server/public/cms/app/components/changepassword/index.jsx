import React from 'react';
import { request, logout } from '../../api/index.js';

class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            oldPassword: '',
            newPassword: '',
            verifyPassword: ''
        }
    }

    handleOldPassword = (e) => {
        const oldPassword = e.target.value;
        this.setState({ oldPassword });
    }

    handleNewPassword = (e) => {
        const newPassword = e.target.value;
        this.setState({ newPassword });
    }

    handleVerifyPassword = (e) => {
        const verifyPassword = e.target.value;
        this.setState({ verifyPassword });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        if (!this.state.oldPassword || !this.state.newPassword || !this.state.verifyPassword) {
            this.setState({ error: 'Toate campurile sunt obligatorii!' });
        } else if (this.state.newPassword === this.state.oldPassword) {
            this.setState({ error: 'Noua parola trebuie sa fie diferita de cea veche!' })
        } else if (this.state.verifyPassword !== this.state.newPassword) {
            this.setState({ error: 'Noua parola nu se verifica!' })
        } else {
            const chPass = await request('PATCH', '/change-password', {
                password: this.state.oldPassword,
                newPassword: this.state.newPassword,
                newPasswordDup: this.state.verifyPassword
            });
            if (chPass.message) {
                let e = chPass.message.split('::');
                e = e[e.length - 1];
                this.setState({ error: e });
            } else if (chPass.success) {
                this.setState({ error: 'Parola schimbata cu success! Veti fi deconectat de pe toate device-urile!' });
                setTimeout(function () {
                    return logout();
                }, 3000);
            }
        }
    }

    render() {
        return (
            <div className="content">
                <div className="table">
                    <div className="table-cell">
                        <form className="login-form">
                            <fieldset>
                                <h3>Modifica Parola</h3>
                                <span className="mod-info">
                                    <p>{this.state.error}</p>
                                </span>
                                <input
                                    className=""
                                    type="password"
                                    placeholder="Parola curenta"
                                    value={this.state.oldPassword}
                                    onChange={this.handleOldPassword}
                                />
                                <input
                                    className=""
                                    type="password"
                                    placeholder="Parola noua"
                                    value={this.state.newPassword}
                                    onChange={this.handleNewPassword}
                                />
                                <input
                                    className="mar2b"
                                    type="password"
                                    placeholder="Reintrodu parola noua"
                                    value={this.state.verifyPassword}
                                    onChange={this.handleVerifyPassword}
                                />
                                <span className="mod-info">
                                    <i className="icon-wlc-info"></i>
                                    <p>Atentie, dupa schimbarea parolei vei fi automat deconectat din toate aplicatiile</p>
                                </span>

                                <button
                                    className="button blue"
                                    onClick={this.handleSubmit}
                                > Schimba Parola </button>
                            </fieldset>
                        </form >
                    </div>
                </div>
            </div>

        );
    }
}

export default ChangePassword;