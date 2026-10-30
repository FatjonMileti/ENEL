import { types } from './actions';

const initialState = {
    user: {},
};

// Clear cached info
function clearCache(state) {
    return { user: {} };
}

// Save items to store
function fetchUserDone(state, payload) {
    return {
        ...state,
        user: payload.user,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.FETCH_USER_DONE:
            return fetchUserDone(state, action.payload);

        default:
            return state;
    }
}
