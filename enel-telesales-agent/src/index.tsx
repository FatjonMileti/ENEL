import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { browserHistory, Router } from 'react-router';
import * as serviceWorker from './workers/serviceWorker';

import store from './store';
import routes from './routes';

require('es6-object-assign').polyfill();

if (!Array.from) {
    Array.from = function(object) {
        'use strict';
        return [].slice.call(object);
    };
}

if (typeof Array.prototype.forEach !== 'function') {
    Array.prototype.forEach = callback => {
        // @ts-ignore
        for (let i = 0; i < this.length; i++) {
            // @ts-ignore
            callback.apply(this, [this[i], i, this]);
        }
    };
}

if (window.NodeList && !NodeList.prototype.forEach) {
    // @ts-ignore
    NodeList.prototype.forEach = Array.prototype.forEach;
}

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory} routes={routes} />
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
