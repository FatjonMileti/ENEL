import { types } from './actions';

const initialState = {
    invalidLogin: false,
};

function setInvalidLogin(state) {
    return {
        ...state,
        invalidLogin: true,
    };
}

function unSetInvalidLogin(state) {
    return {
        ...state,
        invalidLogin: false,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.SET_INVALID_LOGIN:
            return setInvalidLogin(state);
        case types.UNSET_INVALID_LOGIN:
            return unSetInvalidLogin(state);
        default:
            return state;
    }
}
