import { types } from './actions';
import _ from 'lodash';

const initialState = {
    currentData: {},
};

function clearCache(state) {
    return {
        currentData: {},
    };
}

function fetchData(state, payload) {
    debugger;
    return {
        ...state,
        currentData: payload.currentData,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case 'RESET_SESSION':
        case types.CLEAR_CACHE:
            return clearCache(state);

        case types.FETCH_DATA_DONE:
            return fetchData(state, action.payload);

        case types.SET_DATA:
            return fetchData(state, action.payload);

        default:
            return state;
    }
}
