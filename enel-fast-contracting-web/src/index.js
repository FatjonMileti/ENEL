import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { AppContainer } from 'react-hot-loader';

import store from './store';
import routes from './routes';

// Prevent unhandled promise rejection error display
window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
});


ReactDOM.render(
    <AppContainer>
        <Provider store={store}>
            <Router history={browserHistory} routes={routes} />
        </Provider>
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept();
}

// fix for touchscreen blur on input outside click
const isTextInput = node => ['INPUT'].indexOf(node.nodeName) !== -1;

const isBlurDisabled = (node) => {
    if (node.parentNode && node.parentNode.parentNode && node.parentNode.parentNode.parentNode) {
        return node.parentNode.parentNode.parentNode.className.match('custom-autocomplete')
            || node.parentNode.parentNode.className.match('custom-autocomplete');
    }
    return false;
};


document.addEventListener('touchend', (e) => {
    if (!isTextInput(e.target) && isTextInput(document.activeElement) && !isBlurDisabled(e.target)) {
        document.activeElement.blur();
    }
}, false);
