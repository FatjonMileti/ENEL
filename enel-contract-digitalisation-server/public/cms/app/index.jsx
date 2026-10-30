import babelPolyfill from 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, Redirect, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router'

import store, { history } from './store.js';
import Layout from './components/layout.jsx';

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Layout />
        </ConnectedRouter>
    </Provider>, document.getElementById('app')
);