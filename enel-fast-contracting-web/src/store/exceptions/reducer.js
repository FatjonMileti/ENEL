import Immutable from 'seamless-immutable';
import { types } from './actions';

const initialState = Immutable({
    itemsByField: {
        // fieldName: errorMessage
    },
});

// Clear errors cache
function clear(state) {
    return state.merge(initialState);
}

// Add exception details to state
function add(state, payload) {
    const { errors } = payload.exception;
    return state.merge({
        itemsByField: errors,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR:
    case 'RESET_SESSION':
        return clear(state);

    case types.ADD:
        return add(state, action.payload);

    default:
        return state;
    }
}
