import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect, Link } from 'react-router-dom';

import Swiper from './swiper.jsx';
import Sidebar from './sidebar.jsx';
import Header from './header.jsx';

import DoorToDoor from './doortodoor/index.jsx';
import FastContract from './fastcontract/index.jsx';
import OCR from './ocr/index.jsx';
import AgentList from './agent/list.jsx';
import AgentDetails from './agent/details.jsx';
import AgentProfile from './agent/profile.jsx';
import Alerts from './alerts/index.jsx';
import ChangePassword from './changepassword/index.jsx';
import AppLog from './app-log/index.jsx';
import InvoiceExamples from './invoice-examples/index';
import InvoiceExamplesAdd from './invoice-examples/add';
import InvoiceExamplesEdit from './invoice-examples/edit';
import Version from './versions/index.jsx';

import NotFound from './notfound.jsx';

import toastr from 'toastr';

import api from '../api/index.js';

class Layout extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.setUser();

        toastr.options = {
            "newestOnTop": true,
            "positionClass": "toast-bottom-right",
            "timeOut": "2000",
            "preventDuplicates": true
        }
    }

    getClass(path) {
        if (path.indexOf('/easyofficers') !== -1)
            return 'tpl-with-flex-sidebar tpl-agent-profile';
        if (path.indexOf('/officerprofile') !== -1)
            return 'tpl-with-flex-sidebar tpl-user';

        switch (path) {
            case '/doortodoor':
                return 'tpl-with-flex-sidebar tpl-easy-door-to-door';
            case '/ocr':
                return 'tpl-with-flex-sidebar tpl-ocr-counter-status';
            case '/fastcontract':
                return 'tpl-with-flex-sidebar tpl-fast-contract';
            case '/alerts':
                return 'tpl-with-flex-sidebar tpl-alerts-reports';
            case '/changepassword':
            case '/invoice-examples':
            case '/invoice-examples/add':
            case '/invoice-examples/edit':
                return 'tpl-change-password';
            case '/applogs':
                return 'tpl-with-flex-sidebar tpl-app-log-reports';
            default:
                return 'tpl-easy-door-to-door';
        }
    }

    hasFilter(path) {
        if (path.indexOf('/easyofficers/') !== -1)
            return true;

        switch (path) {
            case '/doortodoor':
                return true;
            case '/fastcontract':
                return true;
            case '/applogs':
                return true;
            case '/alerts':
                return true;
            default:
                return false;
        }
    }

    renderRoutes() {
        if (this.props.isAdmin) {
            return (
                <Switch>
                    <Route path='/ocr' component={OCR} />
                    <Route path='/doortodoor' render={() => <DoorToDoor />} />
                    <Route path='/easyofficers/:id' component={AgentDetails} />
                    <Route path='/easyofficers' component={AgentList} />
                    <Route path='/officerprofile/:id' component={AgentProfile} />
                    <Route path='/fastcontract' component={FastContract} />
                    <Route path='/alerts' component={Alerts} />
                    <Route path='/notfound' component={NotFound} />
                    <Route path='/changepassword' component={ChangePassword} />
                    <Route path='/applogs' component={AppLog}/>
                    <Route path='/invoice-examples/add' component={InvoiceExamplesAdd} />
                    <Route path='/invoice-examples/edit' component={InvoiceExamplesEdit} />
                    <Route path='/invoice-examples' component={InvoiceExamples} />
                    <Route path='/versions' component={Version} />
                    <Redirect exact path='/' to='ocr' />
                    <Redirect path='/' to='notfound' />
                    <Redirect path='/*' to='notfound' />
                </Switch>
            );
        } else if (!this.props.isUser) {
            return (
                <Switch>
                    <Route path='/doortodoor' render={() => <DoorToDoor />} />
                    <Route path='/easyofficers/:id' component={AgentDetails} />
                    <Route path='/easyofficers' component={AgentList} />
                    <Route path='/officerprofile/:id' component={AgentProfile} />
                    <Route path='/fastcontract' component={FastContract} />
                    <Route path='/alerts' component={Alerts} />
                    <Route path='/notfound' component={NotFound} />
                    <Route path='/changepassword' component={ChangePassword} />               
                    <Redirect exact path='/' to='doortodoor' />
                    <Redirect path='/' to='notfound' />
                    <Redirect path='/*' to='notfound' />
                </Switch>
            );
        } else {
            return (
                <Switch>
                    <Route path='/changepassword' component={ChangePassword} />
                    <Route path='/notfound' component={NotFound} />
                    <Redirect exact path='/' to='changepassword' />
                    <Redirect path='/' to='notfound' />
                    <Redirect path='/*' to='notfound' />
                </Switch>
            );
        }
    }

    render() {
        if (!this.props.user.info) {
            return null;
        }
        const isAudimin = this.props.isAdmin || this.props.isAuditor;
        return (
            <div className={`wrapper view-flex-sidebar${this.props.sidebarShow ? '' : ' collapse-sidebar'}${this.props.settingsShow ? ' view-settings-menu' : ''}`}>
                <Sidebar />
                <div className={`wrapper-content ${this.getClass(this.props.router.location.pathname)}`}>
                    <Header hasFilter={this.hasFilter(this.props.router.location.pathname)} />
                    { this.renderRoutes() }
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        sidebarShow: state.ui.sidebarShow,
        settingsShow: state.ui.settingsShow,
        user: state.user,
        isUser: state.user.isUser,
        isManager: state.user.isManager,
        isAuditor: state.user.isAuditor,
        isAdmin: state.user.isAdmin,

    };
}, dispatch => {
    return {
        setUser: async () => {
            const user = await api.user.info();
            dispatch({ type: 'SET_USER', payload: user });
        }
    }
})(Layout);
