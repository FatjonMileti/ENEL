import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import { logout, tryFetchUser as tryFetchAuthUser } from './store/auth/actions';
import { hasSidebar } from './store/ui/selectors';
import auth from './services/auth';
import Sidebar from './components/Sidebar';

import './App.scss';

class App extends Component<any> {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    public componentDidMount(): void {
        const { location } = this.props;
        if (!location.pathname.match('login')) {
            if (!auth.isValidAccessToken()) {
                this.props.logout();
            } else {
                this.props.tryFetchAuthUser();
            }
        }
    }

    public render() {
        return (
            <Fragment>
                {this.renderSidebar()}
                <div className="App">{this.props.children}</div>
            </Fragment>
        );
    }

    private renderSidebar() {
        if (this.props.hasSidebar) {
            return <Sidebar />;
        }
    }
}

const mapStateToProps = state => ({
    hasSidebar: hasSidebar(state),
});

const mapDispatchToProps = {
    tryFetchAuthUser,
    logout,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
