import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    voucher: [],
});

// Clear cached info
function clearCache(state) {
    return state.merge({
        eneltel: '',
    });
}

// Save eneltel to store
function validateVoucher(state, payload) {
    return state.merge({
        eneltel: payload.eneltel,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.FETCH_ITEM_DONE:
            return validateVoucher(state, action.payload);

        default:
            return state;
    }
}
