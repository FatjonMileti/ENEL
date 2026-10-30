import _ from 'lodash';
import { types } from './actions';

const initialState = {
    step: 1,
    completed: {
        ee: false,
        gaz: false,
    },
    data: {},
};

function clearCache(state) {
    return initialState;
}

function patchSession(state, payload) {
    return {
        ...state,
        data: _.merge(state.data, payload.session),
    };
}

function restoreSession(state, payload) {
    return {
        ...state,
        data: payload.data,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.PATCH:
            return patchSession(state, action.payload);

        case types.RESTORE_SESSION:
            return restoreSession(state, action.payload);

        default:
            return state;
    }
}
