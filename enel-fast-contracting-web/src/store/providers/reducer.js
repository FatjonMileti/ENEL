import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    itemsById: {
        // _id: {item_details}
    },
});

function clearCache(state) {
    return state.merge({
        itemsById: {},
    });
}

function fetchAllItemsDone(state, payload) {
    return state.merge({
        itemsById: _.keyBy(payload.items, item => item.id),
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR_CACHE:
    case 'RESET_SESSION':
        return clearCache(state);

    case types.FETCH_ALL_ITEMS_DONE:
        return fetchAllItemsDone(state, action.payload);

    default:
        return state;
    }
}
