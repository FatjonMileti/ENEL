import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import mainReducer from './reducers/index.js';
import { createLogger } from 'redux-logger';
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
export const history = createBrowserHistory({ basename: '/cms' });

// let middleware = null;
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// middleware = composeEnhancers(applyMiddleware(thunk, routerMiddleware(history), createLogger({
//     collapsed: (getState, action, logEntry) => !logEntry.error
// })));
// let store = createStore(connectRouter(history)(mainReducer), {}, middleware);
// export default store;

const DEBUG = process.env.LOG_LEVEL === 'debug';
const logger = createLogger({ collapsed: (getState, action, logEntry) => !logEntry.error });
let middleware = [
    thunk,
    routerMiddleware(history),
    DEBUG && logger
].filter(Boolean);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default createStore(
    connectRouter(history)(mainReducer), {},
    composeEnhancers(applyMiddleware(...middleware))
);