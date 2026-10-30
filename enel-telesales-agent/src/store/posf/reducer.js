import { types } from './actions';
import _ from 'lodash';

const initialState = {
    currentPlan: {},
};

function clearCache(state) {
    return {
        currentPlace: {},
    };
}

function fetchPlaceDone(state, payload) {
    return {
        ...state,
        place: payload.place,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case 'RESET_SESSION':
        case types.CLEAR_CACHE:
            return clearCache(state);

        case types.FETCH_PLACE_DONE:
            return fetchPlaceDone(state, action.payload);

        case types.SET_CURRENT_PLACE:
            return fetchPlaceDone(state, action.payload);

        default:
            return state;
    }
}
