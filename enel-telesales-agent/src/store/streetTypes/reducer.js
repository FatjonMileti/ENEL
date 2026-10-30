import { types } from './actions';
import _ from 'lodash';

const initialState = {
    itemsById: {
        // _id: {item_details}
    },
};

function clearCache(state) {
    return {
        itemsById: {},
    };
}

function fetchAllItemsDone(state, payload) {
    return {
        itemsById: _.keyBy(payload.items, item => `_${item.id}`),
    };
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
