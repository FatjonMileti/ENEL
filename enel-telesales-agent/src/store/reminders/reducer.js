import _ from 'lodash';

import { types } from './actions';

const initialState = {
    itemsById: {},
    total: 0,
};

function clearCache(state) {
    return {
        itemsById: {},
        total: 0,
    };
}

function fetchItems(state, payload) {
    return {
        itemsById: _.keyBy(payload.items, item => `_${item.id}`),
        total: payload.total,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.FETCH_ITEMS_DONE:
            return fetchItems(state, action.payload);

        default:
            return state;
    }
}
