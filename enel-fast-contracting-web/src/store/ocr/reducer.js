import Immutable from 'seamless-immutable';
import { types } from './actions';

const initialState = Immutable({
    id: null,
    invoice: null,
});

function clearCache(state) {
    return state.merge(initialState);
}

function setId(state, payload) {
    return state.merge({
        id: payload.id,
    });
}

function setInvoice(state, payload) {
    return state.merge({
        invoice: payload.invoice,
    });
}

function unsetId(state) {
    return state.merge({
        id: null,
    });
}

function unsetInvoice(state) {
    return state.merge({
        invoice: null,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR_CACHE:
    case 'RESET_SESSION':
        return clearCache(state);

    case types.SET_ID:
        return setId(state, action.payload);
    case types.SET_INVOICE:
        return setInvoice(state, action.payload);

    case types.UNSET_ID:
        return unsetId(state);
    case types.UNSET_INVOICE:
        return unsetInvoice(state);
    default:
        return state;
    }
}
