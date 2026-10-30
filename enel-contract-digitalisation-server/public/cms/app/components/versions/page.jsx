import React from "react";
import { connect } from "react-redux";
import autoBind from "react-autobind";
import api from '../../api/index.js';
import _ from "lodash";

import toastr from 'toastr';

class VersionsPage extends React.Component {
    state = {
        isLoaded: false,
        form: {
            client_app: window.ANDROID_APP1,
            version: '',
            url: '',
        }
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.getLatest(this.state.form.client_app);
    }

    componentWillUpdate(nextProps) {
        if (!this.state.isLoaded && !_.isEmpty(nextProps.latestVersion)) {
            this.setState({
                isLoaded: true,
                form: {
                    ...this.state.form,
                    version: nextProps.latestVersion.version,
                    url: nextProps.latestVersion.url,
                }
            });
        }
    }

    handleInputChange(e) {
        this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: e.target.value,
            }
        });
    }

    handleAppChange(e) {
        this.setState({
            isLoaded: false,
            form: {
                client_app: e.target.value,
                version: '',
                url: '',
            }
        });
        this.props.getLatest(e.target.value);
    }

    async handleSave(e) {
        e.preventDefault();
        const { form } = this.state;
        const { latestVersion } = this.props;

        if (form.version && form.url) {
            if (
                form.client_app !== latestVersion.client_app ||
                form.version !== latestVersion.version ||
                form.url !== latestVersion.url
            ) {
                await this.props.create(form);
                await this.props.getLatest(form.client_app);
            }
    
            toastr.success(
                'Your latest changes have been saved.',
                'Version saved',
                {
                    timeOut: 3000,
                    fadeOut: 3000
                }
            );
        }
    }

    render() {
        return (
            <div className="content">
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Version</h3>
                    </div>
                    <div className="content-box-body alerts-list">
                        <div className="scrollbar">
                            <div className="box form">
                                <div className="form-row">
                                    <p className="input-box-field active">
                                        <label>Application</label>
                                        <select name="client_app" value={this.state.form.client_app} onChange={this.handleAppChange}>
                                            <option value={window.ANDROID_APP1}>Easy Android</option>
                                            <option value={window.IOS_APP1}>Easy iOS</option>
                                        </select>
                                    </p>
                                </div>
                                <div className="form-row">
                                    <p className="input-box-field active">
                                        <label>Latest Version</label>
                                        <input
                                            type="text"
                                            name="version"
                                            value={this.state.form.version}
                                            onChange={this.handleInputChange}
                                        />
                                    </p>
                                </div>
                                <div className="form-row">
                                    <p className="input-box-field active">
                                        <label>URL</label>
                                        <input
                                            type="text"
                                            name="url"
                                            value={this.state.form.url}
                                            onChange={this.handleInputChange}
                                        />
                                    </p>
                                </div>
                                <button className="button blue" onClick={this.handleSave}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(state => {
    return {
        latestVersion: state.versions.latest,
    }
}, dispatch => {
    return {
        getLatest: (client_app) => {
            dispatch(async (dispatch, getState) => {
                const result = await api.versions.getLatest(client_app);
                dispatch({
                    type: 'APP_LOG/LATEST',
                    payload: result.data.length ? result.data[0] : {}
                });
            });
        },
        create: (data) => {
            dispatch(async (dispatch, getState) => {
                await api.versions.post(data);
            });
        },
    }
})(VersionsPage);