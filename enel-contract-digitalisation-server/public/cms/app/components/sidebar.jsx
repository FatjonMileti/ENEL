import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import toastr from 'toastr';

class Sidebar extends React.Component {
    render() {
        const isAdmin = this.props.isAdmin;
        const isAuditor = this.props.isAuditor;
        
        return (
            <div className="sidebar">
                <div className="menu-btn" onClick={this.props.toggle_sidebar}>
                    <i className="icon-wlc-menu"></i>
                    <i className="icon-wlc-arrow-back"></i>
                </div>
                {
                    !this.props.isUser ?
                        <nav className="main-menu">
                            { isAdmin && <NavLink activeClassName="selected" to="/ocr" title=""><i className="icon-wlc-menu-icon-1"></i><span>OCR</span></NavLink> }
                            <NavLink activeClassName="selected" to="/doortodoor" title=""><i className="icon-wlc-menu-icon-2"></i><span>Easy</span></NavLink>
                            <NavLink activeClassName="selected" to="/easyofficers" title=""><i className="icon-wlc-menu-icon-3"></i><span>Easy officers</span></NavLink>
                            { isAdmin || isAuditor && <NavLink activeClassName="selected" to="/fastcontract" title=""><i className="icon-wlc-menu-icon-4"></i><span>Fast Contract</span></NavLink> }
                            {/* { isAdmin && <NavLink activeClassName="selected" to="/applogs" title=""><i className="icon-wlc-collection"></i><span>App Logs</span></NavLink> } */}
                            { isAdmin && <NavLink activeClassName="selected" to="/versions" title=""><i className="icon-wlc-mobile-app"></i><span>Versions</span></NavLink>}
                            <div className="settings-link" title="">
                                <i className="icon-wlc-settings" onClick={this.props.toggle_settings}></i><span onClick={this.props.toggle_settings}>Settings</span>
                                <div className="settings-menu" title="">
                                    { isAdmin && <NavLink to="/invoice-examples" title=""><span>Invoice Examples</span></NavLink> }
                                    <NavLink to="/changepassword" title=""><span>Change password</span></NavLink>
                                </div>
                            </div>
                            <a className="logout-link" href="login" title=""><i className="icon-wlc-exit"></i><span>Logout</span></a>
                        </nav> :
                        <nav className="main-menu">
                            <div className="settings-link" title="">
                                <i className="icon-wlc-settings" onClick={this.props.toggle_settings}></i><span onClick={this.props.toggle_settings}>Settings</span>
                                <div className="settings-menu" title="">
                                    <NavLink to="/changepassword" title=""><span>Change password</span></NavLink>
                                </div>
                            </div>
                            <a className="logout-link" href="login" title=""><i className="icon-wlc-exit"></i><span>Logout</span></a>
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