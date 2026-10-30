import _ from 'lodash';

import { types } from './actions';

const initialState = {
    itemsById: {},
    currentItem: null,
    total: 0,
};

function clearCache(state) {
    return {
        itemsById: {},
        total: 0,
    };
}

function fetchItemsDone(state, payload) {
    return {
        ...state,
        itemsById: _.keyBy(payload.items, item => `_${item.id}`),
        total: payload.total,
    };
}

function setCurrentItem(state, payload) {
    return {
        ...state,
        currentItem: payload.item,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.FETCH_ITEMS_DONE:
            return fetchItemsDone(state, action.payload);

        case types.SET_CURRENT_ITEM:
            return setCurrentItem(state, action.payload);

        default:
            return state;
    }
}
