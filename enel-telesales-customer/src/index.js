import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as serviceWorker from './workers/serviceWorker';
import { Provider } from 'react-redux';
import store from './store';
import AppWrapper from './AppWrapper';

require('es6-object-assign').polyfill();

// comment

if (!Array.from) {
    Array.from = function(object) {
        'use strict';
        return [].slice.call(object);
    };
}

if (typeof Array.prototype.forEach != 'function') {
    // eslint-disable-next-line no-extend-native
    Array.prototype.forEach = callback => {
        for (let i = 0; i < this.length; i++) {
            callback.apply(this, [this[i], i, this]);
        }
    };
}

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}



const container = document.getElementById('root');
const rootContainer = ReactDOMClient.createRoot(container);

rootContainer.render(
    <React.StrictMode>
        <Provider store={store}>
            <AppWrapper />
        </Provider>
    </React.StrictMode>
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
