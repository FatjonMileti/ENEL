import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import moment from 'moment';
import Swiper from 'swiper';

import _ from 'lodash';

import { isEmail } from '../../../helpers/utils.js';

class Alert extends React.Component {

    state = {
        emails: [],
        loaded: false,
        email: "",
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.loadEmails(this.props);
    }

    componentWillUpdate(nextProps) {
        this.loadEmails(nextProps);
    }

    loadEmails(props) {
        if (!_.isEmpty(props) && !this.state.loaded) {
            this.setState({
                emails: props.alert.emails,
                loaded: true,
            });
        }
    }

    handleRemove(email) {
        const emails = _.clone(this.state.emails);
        this.setState({
            emails: _.filter(emails, item => item !== email),
        });
    }

    handleEmailChange(e) {
        const email = e.target.value;
        const char = email[email.length - 1];

        if (char == " ") {
            if (isEmail(this.state.email)) {
                const emails = _.clone(this.state.emails);
                emails.push(this.state.email);
                this.setState({
                    emails: _.uniq(emails),
                    email: "",
                });
            }
        } else {
            this.setState({ email });
        }
    }

    handleSave(e) {
        e.preventDefault();
        if (this.props.onSave) this.props.onSave(this.props.alert.id, { emails: this.state.emails });
    }

    renderEmails(emails) {
        return _.map(emails, email => (
            <span className="at-tag">
                <i className="icon-wlc-close" onClick={() => this.handleRemove(email)}></i>{email}
            </span>
        ));
    }

    render() {
        return (
            <div className="box" key={this.props.alert.id}>
                <h3>{this.props.alert.name}</h3>
                <p>{this.props.alert.description}</p>
                <div className="autocomplete-tags">
                    {this.renderEmails(this.state.emails)}
                    <input
                        className="at-input"
                        type="text"
                        value={this.state.email}
                        placeholder="Enter email address"
                        onChange={this.handleEmailChange}
                    />
                </div>

                <button className="button black" onClick={this.handleSave}>Save List</button>
            </div>
        )
    }
}

export default Alert;