import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    info: {},
    nlc: {},
    nlcValidation: {},
    options: {},
    flow: '',
    error: '',
    hasEmail: false,
    startDate: '',
});

function clearCache(state) {
    return state.merge(initialState);
}

function clearError(state) {
    return state.merge({ error: '' });
}

function clearNLC(state) {
    return state.merge({ nlc: {}, nlcValidation: {} });
}

function setClient(state, payload) {
    return state.merge({ info: payload.client });
}

function setNLC(state, payload) {
    return state.merge({ nlc: payload.nlc });
}

function setNLCValidation(state, payload) {
    return state.merge({ nlcValidation: payload.validation });
}

function setFlow(state, payload) {
    return state.merge({
        flow: payload.flow,
        nlc: {},
    });
}

function setOptions(state, payload) {
    return state.merge({ options: payload.options }, { deep: true });
}

function setError(state, payload) {
    return state.merge({
        error: payload.error,
    });
}

function hasEmail(state, payload) {
    return state.merge({
        hasEmail: payload.hasEmail,
    });
}

function setStartDate(state, payload) {
    return state.merge({ startDate: payload.startDate });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.CLEAR_ERROR:
            return clearError(state);

        case types.CLEAR_NLC:
            return clearNLC(state);

        case types.SET_CLIENT:
            return setClient(state, action.payload);

        case types.SET_NLC:
            return setNLC(state, action.payload);

        case types.SET_NLC_VALIDATION:
            return setNLCValidation(state, action.payload);

        case types.SET_FLOW:
            return setFlow(state, action.payload);

        case types.SET_OPTIONS:
            return setOptions(state, action.payload);

        case types.SET_ERROR:
            return setError(state, action.payload);

        case types.HAS_EMAIL:
            return hasEmail(state, action.payload);

        case types.SET_START_DATE:
            return setStartDate(state, action.payload);

        default:
            return state;
    }
}
