import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import toastr from 'toastr';

class Sidebar extends React.Component {
    render() {
        const isAdmin = this.props.isAdmin;
        const isAuditor = this.props.isAuditor;
        const isFsdAdmin = this.props.isFsdAdmin;
        const isUser = this.props.isUser;
        const isManager = this.props.isManager;
        return (
            <div className="sidebar">
                <div className="menu-btn" onClick={this.props.toggle_sidebar}>
                    <i className="icon-wlc-menu"></i>
                    <i className="icon-wlc-arrow-back"></i>
                </div>
                
                {
                    !this.props.isUser ?
                        <nav className="main-menu">
                            <div className="scrollbar">
                                <NavLink to="/overview" title=""><i className="icon-wlc-monitor"></i><span>Overview</span></NavLink>
                                {/* { isAdmin && <NavLink to="/cms-v2/statistics" title=""><i className="icon-wlc-funnel-performance"></i><span>Statistics</span></NavLink>} */}
                                { isAdmin && <NavLink to="/ocr" title=""><i className="icon-wlc-menu-icon-1"></i><span>OCR</span></NavLink> }
                                <NavLink to="/sessions" title=""><i className="icon-wlc-menu-icon-2"></i><span>Sessions</span></NavLink>
                                <NavLink to="/sessions-history" title=""><i className="icon-wlc-menu-icon-2"></i><span>Sessions History</span></NavLink>
                                { (isFsdAdmin || isAdmin) && <NavLink to="/investigation" title=""><i className="icon-wlc-menu-icon-4"></i><span>Investigation</span></NavLink> }
                                {/* { isAdmin && <NavLink to="/docupload" title=""><i className="icon-wlc-arrow-up-2"></i><span>Upload Documents</span></NavLink>} */}
                                {/* isAdmin && <NavLink to="/sessions-map" title=""><i className="icon-wlc-pin"></i><span>Sessions Map</span></NavLink>*/}
                                <NavLink to="/easyofficers" title=""><i><img src="/cms-v2/img/svg/icon.svg" alt="Easy Officers" width={25}/></i><span>Easy officers</span></NavLink>
                                {/* { isAdmin && <NavLink to="/applogs" title=""><i className="icon-wlc-collection"></i><span>App Logs</span></NavLink> } */}
                                { (isAdmin || isAuditor) && <NavLink to="/blacklist" title=""><i className="icon-wlc-lock-2"></i><span>Blacklist</span></NavLink> }
                                { (isFsdAdmin || isAdmin) && <NavLink to="/whitelist" title=""><i className="icon-wlc-menu-icon-4"></i><span>Whitelist</span></NavLink> }
                                { (isFsdAdmin || isAdmin) && <NavLink to="/variante-pret-cache" title=""><i className="icon-wlc-menu-icon-4"></i><span>VARIANTE PRET - CACHE</span></NavLink> }
                                { (isFsdAdmin || isAdmin || !isUser) && <NavLink to="/query-report" title=""><i className="icon-wlc-menu-icon-4"></i><span>Query Report</span></NavLink> }
                                {/* isAdmin && <NavLink to="/connectivity" title=""><i className="icon-wlc-connectivity"></i><span>Connectivity Network Status</span></NavLink>*/}
                                {/* <NavLink to="/alerts" title=""><i className="icon-wlc-menu-icon-5"></i><span>Alerts &amp; Reports</span></NavLink> */}
                                { isAdmin && <NavLink to="/versions" title=""><i className="icon-wlc-mobile-app"></i><span>Versions</span></NavLink>}
                            </div>
                            <div className="settings-link" title="">
                                <i className="icon-wlc-settings" onClick={this.props.toggle_settings}></i><span onClick={this.props.toggle_settings}>Settings</span>
                                <div className="settings-menu" title="">
                                    <NavLink to="/changepassword" title=""><span>Change password</span></NavLink>
                                </div>
                            </div>
                            <a className="logout-link" href="/cms-v2/login" title=""><i className="icon-wlc-exit"></i><span>Logout</span></a>
                        </nav> :
                        <nav className="main-menu">
                            <div className="settings-link" title="">
                                <i className="icon-wlc-settings" onClick={this.props.toggle_settings}></i><span onClick={this.props.toggle_settings}>Settings</span>
                                <div className="settings-menu" title="">
                                    <NavLink to="/changepassword" title=""><span>Change password</span></NavLink>
                                </div>
                            </div>
                            <a className="logout-link" href="/cms-v2/login" title=""><i className="icon-wlc-exit"></i><span>Logout</span></a>
                        </nav>
                }
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        isUser: state.user.isUser,
        isAdmin: state.user.isAdmin,
        isAuditor: state.user.isAuditor,
        isManager: state.user.isManager,
        isFsdAdmin: state.user.isFsdAdmin
    };
}, (dispatch) => {
    return {
        toggle_sidebar: () => {
            dispatch((dispatch, getState) => {
                let state = getState();
                if (state.ui.settingsShow)
                    dispatch({ type: 'TOGGLE_SETTINGS' });
                dispatch({ type: 'TOGGLE_SIDEBAR' });
            });
        },
        toggle_settings: () => {
            dispatch((dispatch, getState) => {
                let state = getState();
                if (!state.ui.sidebarShow)
                    dispatch({ type: 'TOGGLE_SIDEBAR' });
                dispatch({ type: 'TOGGLE_SETTINGS' });
            });
        }
    };
})(Sidebar);
