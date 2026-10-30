import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    generatedDocs: [],
    eeOwnerDocs: {},
    gazOwnerDocs: {},
    id: null,
    eeInvoice: [],
    gazInvoice: [],
    eeInvoicePDF: null,
    gazInvoicePDF: null,
    eeBusinessIdDocs: {},
    gazBusinessIdDocs: {},
});

function clearCache(state) {
    return state.merge(initialState);
}

function setGeneratedDocs(state, payload) {
    return state.merge({ generatedDocs: payload.docs });
}

function setOwnerDocs(state, payload) {
    return state.merge({
        [`${payload.flow.toLowerCase()}OwnerDocs`]: payload.docs,
    });
}

function setBusinessIdDocs(state, payload) {
    return state.merge({
        [`${payload.flow.toLowerCase()}BusinessIdDocs`]: payload.docs,
    });
}

function setID(state, payload) {
    return state.merge({ id: payload.image });
}

function setInvoice(state, payload) {
    return state.merge({
        [`${payload.flow.toLowerCase()}Invoice`]: payload.images,
        [`${payload.flow.toLowerCase()}InvoicePDF`]: payload.pdf,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR_CACHE:
    case 'RESET_SESSION':
        return clearCache(state);

    case types.SET_GENERATED_DOCS:
        return setGeneratedDocs(state, action.payload);

    case types.SET_OWNER_DOCS:
        return setOwnerDocs(state, action.payload);

    case types.SET_ID:
        return setID(state, action.payload);

    case types.SET_INVOICE:
        return setInvoice(state, action.payload);

    case types.SET_BUSINESS_ID_DOCS:
        return setBusinessIdDocs(state, action.payload);

    default:
        return state;
    }
}
