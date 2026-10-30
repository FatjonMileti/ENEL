import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import Immutable from 'seamless-immutable';
import thunk from 'redux-thunk';
import reducers from './reducers';
import localStorageService from 'services/localStorage';
import _ from 'lodash';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line

const persistedState = Immutable(localStorageService.getState());
const store = createStore(
    combineReducers(reducers),
    persistedState,
    composeEnhancers(applyMiddleware(thunk))
);

store.subscribe(_.throttle(() => {
    localStorageService.saveState(store.getState());
}, 1000));

export default store;
