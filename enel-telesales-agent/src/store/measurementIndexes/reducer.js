import { types } from './actions';
import _ from 'lodash';

const initialState = {};

// Clear cached info
function clearCache(state) {
    return initialState;
}

// Save data to store
function queryIndexesDone(state, payload) {
    return {
        ...state,
        ...payload,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.QUERY_INDEXES_DONE:
            return queryIndexesDone(state, action.payload);

        default:
            return state;
    }
}
