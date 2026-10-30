import { types } from './actions';

const initialState = {
    info: {},
    nlc: {},
    nlcValidation: {},
    options: {},
    startDate: '',
    flow: '',
    link: '',
    error: '',
    hasEmail: false,
};

function clearCache(state) {
    return {
        info: {},
        nlc: {},
        nlcValidation: {},
        options: {},
        startDate: '',
        flow: '',
        link: '',
        error: '',
        hasEmail: false,
    };
}

function clearError(state) {
    return {
        ...state,
        error: '',
    };
}

function clearNLC(state) {
    return {
        ...state,
        nlc: {},
        nlcValidation: {},
    };
}

function setClient(state, payload) {
    return {
        ...state,
        info: payload.client,
    };
}

function setNLC(state, payload) {
    return {
        ...state,
        nlc: {
            ...state.nlc,
            [payload.nlc.code]: payload.nlc,
        },
    };
}

function setNLCValidation(state, payload) {
    return {
        ...state,
        nlcValidation: {
            ...state.nlcValidation,
            [payload.validation.code]: payload.validation,
        },
    };
}

function setStartDate(state, payload) {
    return {
        ...state,
        startDate: payload.startDate,
    };
}

function setOptions(state, payload) {
    // TODO manage ee ang gaz flows ENEL-1227
    return {
        ...state,
        options: payload.options,
    };
}

function setLink(state, payload) {
    return {
        ...state,
        link: payload.link,
    };
}

function setError(state, payload) {
    return {
        ...state,
        error: payload.error,
    };
}

function hasEmail(state, payload) {
    return {
        ...state,
        hasEmail: payload.hasEmail,
    };
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
        case types.SET_START_DATE:
            return setStartDate(state, action.payload);
        case types.SET_OPTIONS:
            return setOptions(state, action.payload);
        case types.SET_LINK:
            return setLink(state, action.payload);
        case types.SET_ERROR:
            return setError(state, action.payload);
        case types.HAS_EMAIL:
            return hasEmail(state, action.payload);
        default:
            return state;
    }
}
