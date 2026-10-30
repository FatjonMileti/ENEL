import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    voucher: {},
});

// Clear cached info
function clearCache(state) {
    state = initialState
    return state;
}

// Save voucher to store
function setItem(state, payload) {
    return state.merge({
        voucher: payload.voucher,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.FETCH_ITEM_DONE:
            return setItem(state, action.payload);

        default:
            return state;
    }
}
