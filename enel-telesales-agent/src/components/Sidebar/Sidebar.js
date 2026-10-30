import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import autoBind from 'react-autobind';

import { setDateFilters, setFilters, setSearch, toggleSidebar } from 'store/ui/actions';
import { logout } from 'store/auth/actions';

import { expandSidebar } from 'store/ui/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';

import { ROLES } from 'services/user';

import './Sidebar.scss';

class Sidebar extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    isItemSelected(path) {
        return window.location.pathname.match(`/${path}`);
    }

    renderLeadsItem() {
        const { authUser } = this.props;
        if (
            authUser &&
            [ROLES.LA, ROLES.LMA, ROLES.LSA, ROLES.LRA, ROLES.BUM].includes(authUser.role)
        ) {
            return (
                <a
                    href="#"
                    className={this.isItemSelected('leads') ? 'selected' : ''}
                    onClick={e => this.handleLinkClick(e, '/leads')}
                >
                    <i className="ion-ios-funnel" />
                    <span>Leads</span>
                </a>
            );
        }
    }

    handleLinkClick(e, route) {
        e.preventDefault();
        this.props.setSearch(null);
        this.props.setFilters({});
        this.props.setDateFilters({ start: null, end: null });

        browserHistory.push(route);
        this.setState({ routeChanged: true });
        if (this.props.show) {
            this.props.toggleSidebar();
        }
    }

    handleLogoutClick() {
        this.props.logout();
    }

    render() {
        return (
            <Fragment>
                <div className={`sidebar-overlay ${this.props.show ? 'show' : ''}`} />
                <div className={`sidebar ${this.props.show ? '' : 'collapse-sidebar'}`}>
                    <div className="menu-btn" onClick={this.props.toggleSidebar}>
                        <i className="icon-wlc-menu" />
                        <i className="icon-wlc-arrow-back" />
                    </div>
                    <nav className="main-menu">
                        <a
                            href="#"
                            className={this.isItemSelected('sessions') ? 'selected' : ''}
                            onClick={e => this.handleLinkClick(e, '/sessions')}
                        >
                            <i className="icon-wlc-monitor" />
                            <span>Overview</span>
                        </a>
                        {this.renderLeadsItem()}
                        <a href="#" className="logout-link" onClick={this.handleLogoutClick}>
                            <i className="icon-wlc-exit" />
                            <span>Logout</span>
                        </a>
                    </nav>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    authUser: getAuthUser(state),
    show: expandSidebar(state),
});

const mapDispatchToProps = {
    toggleSidebar,
    logout,
    setSearch,
    setFilters,
    setDateFilters,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);
