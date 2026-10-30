import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect, Routes, Navigate } from 'react-router-dom';

import Swiper from './swiper.jsx';
import Sidebar from './sidebar';
import Header from './header.jsx';

import Statistics from './statistics/index.jsx';
import DocUpload from './docupload/index.jsx';
import Overview from './overview/index.jsx';
import OCR from './ocr/index.jsx';
import Sessions from './sessions/index.jsx';
import SessionsHistory from './sessions-history/index.jsx';
import Investigation from './investigation/index.jsx';
import SessionsMap from './sessions-map/index.jsx';
import AgentList from './agent/list.jsx';
import AgentDetails from './agent/details.jsx';
import AgentProfile from './agent/profile.jsx';
import Alerts from './alerts/index.jsx';
import AppLog from './app-log/index.jsx';
import Blacklist from './blacklist/index.jsx'
import Whitelist from './whitelist/index.jsx'
import QueryReporter from './query-report/index.jsx'
import ChangePassword from './changepassword/index.jsx';
import Connectivity from './connectivity/index.jsx';
import Version from './versions/index.jsx';
import { useNavigate } from 'react-router-dom';

import NotFound from './notfound.jsx';

import toastr from 'toastr';

import api from '../api/index.js';
import VariantePretCache from "./variante-pret-cache";

import { useParams } from 'react-router-dom';

const WithNavigate = (props) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const Comp = props.comp;

    return <Comp navigate={navigate} match={{
        params: { id: id }
    }} />
}

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

        switch ('/'+path) {
            case '/statistics':
                return 'tpl-with-flex-sidebar tpl-statistics';
            case '/overview':
                return 'tpl-with-flex-sidebar tpl-overview';
            case '/sessions':
                return 'tpl-with-flex-sidebar tpl-easy-door-to-door';
            case '/sessions-history':
                return 'tpl-with-flex-sidebar tpl-easy-door-to-door';
            case '/sessions-map':
                return 'tpl-with-flex-sidebar tpl-easy-door-to-door';
            case '/investigation':
                return 'tpl-with-flex-sidebar tpl-easy-door-to-door';
            case '/ocr':
                return 'tpl-with-flex-sidebar tpl-ocr-counter-status';
            case '/fastcontract':
                return 'tpl-with-flex-sidebar tpl-fast-contract';
            case '/connectivity':
                return 'tpl-with-flex-sidebar tpl-connectivity';
            case '/alerts':
                return 'tpl-with-flex-sidebar tpl-alerts-reports';
            case '/applogs':
                return 'tpl-with-flex-sidebar tpl-alerts-reports';
            case '/blacklist':
                return 'tpl-with-flex-sidebar tpl-app-log-reports';
            case '/whitelist':
                return 'tpl-with-flex-sidebar tpl-app-log-reports';
            case '/query-report':
                return 'tpl-with-flex-sidebar tpl-app-log-reports';
            case '/changepassword':
                return 'tpl-change-password';
            default:
                return 'tpl-easy-door-to-door';
        }
    }

    hasFilter(path) {
        if (path.indexOf('/easyofficers/') !== -1)
            return true;

        switch (path) {
            case '/statistics':
            case '/overview':
            case '/sessions':
            case '/sessions-history':
            case '/sessions-map':
            case '/investigation':
            case '/docupload':
            case '/fastcontract':
            case '/alerts':
            case '/applogs':
            case '/blacklist':
            case '/whitelist':
            case '/query-report':
            case '/connectivity':
                return true;
            default:
                return false;
        }
    }

    renderRoutes() {
        if (this.props.isAdmin) {
            return (
                <Routes>
                    <Route path='/ocr' element={<OCR />} />
                    <Route path='/overview' element={<WithNavigate comp={Overview} />} />
                    <Route path='/statistics' element={<WithNavigate comp={Statistics} />} />
                    {/* Route path='/sessions-map' element={<SessionsMap} /> */}
                    <Route path='/sessions' element={<WithNavigate comp={Sessions} />} />
                    <Route path='/sessions-history' element={<WithNavigate comp={SessionsHistory} />} />
                    <Route path='/investigation' element={<WithNavigate comp={Investigation} />} />
                    <Route path='/easyofficers/:id' element={<WithNavigate comp={AgentDetails} />} />
                    <Route path='/easyofficers' element={<WithNavigate comp={AgentList} />} />
                    <Route path='/officerprofile/:id' element={<WithNavigate comp={AgentProfile} />} />
                    {/* Route path='/connectivity' element={Connectivity} />*/}
                    {/* <Route path='/alerts' element={<Alerts />} /> */}
                    {/* <Route path='/notfound' element={<NotFound />} /> */}
                    <Route path='/changepassword' element={<ChangePassword />} />
                    <Route path='/applogs' element={<AppLog />} />
                    <Route path='/blacklist' element={<Blacklist />} />
                    <Route path='/whitelist' element={<Whitelist />} />
                    <Route path='/variante-pret-cache' element={<VariantePretCache />} />
                    <Route path='/query-report' element={<QueryReporter />} />
                    <Route path='/versions' element={<Version />} />
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    {/* <Redirect exact path='/' to='overview' /> */}
                    {/* <Redirect path='/' to='notfound' /> */}
                    {/* <Redirect path='/*' to='overview' /> */}
                    {/* <Redirect path='/' to='/overview' /> */}
                    {/* <Redirect path='/' to='/notfound' /> */}
                    {/* <Redirect path='/*' to='/overview' /> */}
                    {/* <Redirect path='/*' to='/notfound' /> */}
                </Routes>
            );
        } else if (this.props.isFsdAdmin) {
            return (
                <Routes>
                    <Route path='/overview' element={<WithNavigate comp={Overview} />} />
                    <Route path='/statistics' element={<WithNavigate comp={Statistics} />} />
                    {/* Route path='/sessions-map' element={<SessionsMap} /> */}
                    <Route path='/sessions' element={<WithNavigate comp={Sessions} />} />
                    <Route path='/sessions-history' element={<WithNavigate comp={SessionsHistory} />} />
                    <Route path='/investigation' element={<WithNavigate comp={Investigation} />} />
                    <Route path='/easyofficers' element={<WithNavigate comp={AgentList} />} />
                    <Route path='/changepassword' element={ChangePassword} />
                    <Route path='/whitelist' element={<Whitelist/>} />
                    <Route path='/query-report' element={<QueryReporter/>} />
                    <Route path='/variante-pret-cache' element={<VariantePretCache />} />
                    {/* <Route path='/easyofficers/:id' element={AgentDetails} />
                    <Route path='/easyofficers' element={AgentList} />
                    <Route path='/officerprofile/:id' element={AgentProfile} /> */}
                    {/* Route path='/connectivity' element={Connectivity} />*/}
                    {/* <Route path='/alerts' element={Alerts} /> */}
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    {/* <Redirect exact path='/' to='overview' /> */}
                    {/* <Redirect path='/' to='overview' /> */}
                    {/* <Redirect path='/' to='notfound' /> */}
                    {/* <Redirect path='/*' to='overview' /> */}
                    {/* <Redirect path='/*' to='notfound' /> */}
                </Routes>
            );
        } else if (!this.props.isUser) {
            return (
                <Routes>
                    <Route path='/overview' element={<WithNavigate comp={Overview} />} />
                    {/* <Route path='/statistics' element={Statistics} /> */}
                    {/* <Route path='/sessions-map' element={<SessionsMap />} /> */}
                    <Route path='/sessions' element={<WithNavigate comp={Sessions} />} />
                    <Route path='/sessions-history' element={<WithNavigate comp={SessionsHistory} />} />
                    <Route path='/easyofficers/:id' element={<WithNavigate comp={AgentDetails} />} />
                    <Route path='/easyofficers' element={<WithNavigate comp={AgentList} />} />
                    <Route path='/officerprofile/:id' element={<WithNavigate comp={AgentProfile} />} />
                    <Route path='/blacklist' element={<Blacklist />} />
                    <Route path='/docupload' element={<DocUpload />} />
                    <Route path='/query-report' element={<QueryReporter />} />
                    {/* <Route path='/connectivity' element={Connectivity} /> */}
                    {/* <Route path='/alerts' element={Alerts} /> */}
                    <Route path='/notfound' element={NotFound} />
                    <Route path='/changepassword' element={ChangePassword} />
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    {/* <Redirect exact path='/' to='overview' /> */}
                    {/* <Redirect path='/' to='notfound' /> */}
                    {/* <Redirect path='/' to='overview' /> */}
                    {/* <Redirect path='/*' to='overview' /> */}
                    {/* <Redirect path='/*' to='notfound' /> */}
                </Routes>
            );

        } else {
            return (
                <Routes>
                    <Route path='/changepassword' element={<ChangePassword />} />
                    {/* <Route path='/notfound' element={NotFound} /> */}
                    <Route path="/" element={<Navigate to="/changepassword" replace />} />
                    {/* <Redirect exact path='/' to='changepassword' /> */}
                    {/* <Redirect path='/' to='changepassword' /> */}
                    {/* <Redirect path='/' to='notfound' /> */}
                    {/* <Redirect path='/*' to='changepassword' /> */}
                    {/* <Redirect path='/*' to='notfound' /> */}
                </Routes>
            );
        }
    }

    render() {
        if (!this.props.user?.info) {
            return null;
        }
        return (
            <div className={`wrapper view-flex-sidebar${this.props.sidebarShow ? '' : ' collapse-sidebar'}${this.props.settingsShow ? ' view-settings-menu' : ''}`}>
                <Sidebar />
                <div className={`wrapper-content ${this.getClass(window.location.href.split("/").pop())}`}>
                    <WithNavigate comp={(props) => <Header navigate={props.navigate} hasFilter={this.hasFilter('/' + window.location.href.split("/").pop())} />} />
                    {this.renderRoutes()}
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        sidebarShow: state.ui?.sidebarShow,
        settingsShow: state.ui?.settingsShow,
        user: state.user,
        isUser: state.user?.isUser,
        isManager: state.user?.isManager,
        isAuditor: state.user?.isAuditor,
        isAdmin: state.user?.isAdmin,
        isFsdAdmin: state.user?.isFsdAdmin

    };
}, dispatch => {
    return {
        setUser: async () => {
            const user = await api.user.info();
            dispatch({ type: 'SET_USER', payload: user });
        }
    }
})(Layout);
