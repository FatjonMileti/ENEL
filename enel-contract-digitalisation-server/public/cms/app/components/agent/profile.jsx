import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';
import api from '../../api';
import _ from 'lodash';

import fields from './fields.js';
import TabsButtons from '../_parts/form/tabs/tabsButtons';
import Form, { transformFieldsInSate } from '../_parts/form';
import Errors from '../_parts/form/errors';

//TODO: Move <that> in props
class AgentProfile extends React.Component {
    constructor(props) {
        super(props);
        this.id = this.props.match.params.id;
        this.form = null;
        this.initialFormData = null;
        this.state = {
            isMenuOpen: false,
            selectedId: null,
            disabled: this.id !== 'new' && true,
            hide: this.id !== 'new' && true,
            formData: {},
            errorsShow: false,
            errors: [],
            employedOptions: [{ 'Shop': 1 }, { 'D2D': 0 }]
        };
        this.allHistory = '/easyofficers';
    }

    componentDidMount() {
        this.props.initAgent(this.id);
    }

    componentWillReceiveProps(props) {
        this.initialFormData = Object.assign({}, props.info);
        delete this.initialFormData.createdAt;
        delete this.initialFormData.updatedAt;
        delete this.initialFormData.lastLogin;
        delete this.initialFormData.failedLogins;
    }

    employedOptions() {
        this.setState((prevState) => {
            if (prevState.formData.type === 'vi') {
                return { employedOptions: [{ 'Shop': 1 }, { 'D2D': 0 }] };
            } else {
                return {
                    employedOptions: [{ 'Shop': 1 }],
                    formData: {
                        ...prevState.formData,
                        employed: 1
                    }
                };
            }
        });
    }

    rolesOptions() {
        let options = [
            { "Partner manager": "manager" },
            { "Mobile app user": "user" }
        ];

        if (this.props.user.isAdmin) {
            options = [
                { "Admin": "admin" },
                { "Telesaler": "agent" },
                { "PPC manager": "auditor" },
                { "Telesales Team Leader":"cm"},
                {"Leads Admin": "la"},
                {"Leads Marketing Admin": "lma"},
                {"Leads Sales Admin": "lsa"},
                {"Leads Reports Admin": "lra"},
                {"Business Unit Manager": "bum"},
                ...options
            ]
        }
        return options;
    }

    render() {
        if (this.initialFormData === null)
            return null;

        const canEdit = this.props.user.isAdmin;
        return ([
            <div className="content" key={0} >
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Easy Officer</h3>
                        {canEdit && <TabsButtons
                            that={this}
                            initSaveButton={'Edit Officer'}
                            tabClass={'user-tabs'}
                            collection={'users'}
                            fields={fields}
                        />}
                    </div>
                    <div className="content-box-body" onClick={() => { this.setState({ isMenuOpen: false }); }}>
                        <div className="scrollbar">
                            <div className="box add-users-box">
                                <Errors errors={this.state.errors} show={this.state.errorsShow} />
                                <Form
                                    that={this}
                                    fields={fields}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            <div className="flex-sidebar" key={1}>
                <div className="flex-sidebar-header">
                    <h3>User Activity Overview</h3>
                </div>
                <div className="scrollbar">
                    <div className="box">
                        <p className="panel">
                            <span>Last login:</span>
                            <strong>
                                <i className="icon-wlc-calendar"></i>{this.props.info.lastLogin ? moment(this.props.info.lastLogin).format('DD.MM.YYYY h:mm A') : 'n/a'}
                            </strong>
                        </p>
                        <p className="panel">
                            <span>Logins fails:</span>
                            <strong>
                                <i className="icon-wlc-info"></i>{this.props.info.failedLogins || 0}
                            </strong>
                        </p>
                        <p className="panel">
                            <span>Created at:</span>
                            <strong>
                                <i className="icon-wlc-calendar"></i>{this.props.info.createdAt ? moment(this.props.info.createdAt).format('DD.MM.YYYY h:mm A') : 'n/a'}
                            </strong>
                        </p>
                        <p className="panel">
                            <span>Updated at:</span>
                            <strong>
                                <i className="icon-wlc-calendar"></i>{this.props.info.updatedAt ? moment(this.props.info.updatedAt).format('DD.MM.YYYY h:mm A') : 'n/a'}
                            </strong>
                        </p>
                    </div>
                </div>
            </div>
        ]);
    }
}

const mapStateToProps = (state) => ({
    router: state.router,
    info: state.agent.info,
    canale: state.agent.formSelects.canale,
    teamleads: state.agent.formSelects.teamleads,
    user: state.user,
    // judete: state.agent.formSelects.judete,
    // localitate: state.agent.formSelects.localitate,
});

const mapDispatchToProps = (dispatch) => ({
    initAgent: (id) => {
        dispatch(async (dispatch, getState) => {

            dispatch({ type: 'AGENT/SESSION_LOADING' });

            const undesiderableKeys = [
                "canal.createdAt",
                "canal.denumire",
                "canal.id",
                "canal.internal_id",
                "canal.updatedAt",
                "manager.firstName",
                "manager.lastName",
                "manager.marca",
                "maxPassReachDate"];

            let teamleads = await api.common.find('users', 'role=manager', 100, null, 'firstName', true, ['marca', 'firstName', 'lastName']);
            teamleads = _.map([...teamleads.data], _.partialRight(_.omit, undesiderableKeys));

            let canale = await api.common.find('canal', '', 1000, null, 'denumire', true, ['internal_id', 'denumire']);
            canale = [...canale.data];

            // let judete = await api.common.find('judet', '', 100, null, 'denumire', true, ['denumire']);
            // judete = [...judete.data];

            if (id !== 'new') {
                let agent = await api.user.get(id);
                agent = _.omit(agent, undesiderableKeys);

                // let localitate = await api.common.find('localitate',agent.county ? `judet=${agent.county.toUpperCase()}` : '',1000,null,'denumire',true,['denumire', 'judet']);
                // localitate = [...localitate.data];

                //keys info and formSelects are constants
                dispatch({
                    type: 'INIT_AGENT', payload: {
                        info: {
                            ...agent
                        },
                        formSelects: {
                            canale,
                            teamleads,
                            // judete,
                            // localitate,
                        }
                    }
                });
            } else {
                dispatch({
                    type: 'INIT_AGENT', payload: {
                        info: {
                            ...transformFieldsInSate(fields)
                        },
                        formSelects: {
                            canale,
                            teamleads,
                            // judete,
                            // localitate,
                        }
                    }
                });
            }
        });
    },
    // getLocalitati: async (judet) => {
    //     let localitate = await api.common.find(
    //         'localitate',
    //         judet ? `judet=${judet.toUpperCase()}` : '',
    //         1000,
    //         null,
    //         'denumire',
    //         true,
    //         ['denumire', 'judet']);
    //     localitate = [...localitate.data];
    //     dispatch(async (dispatch, getState) => {
    //         dispatch({ type: 'INIT_AGENT', payload: { formSelects: { localitate } } });
    //     });
    // }
});

export default connect(mapStateToProps, mapDispatchToProps)(AgentProfile);