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

// Save items to store
function fetchAllItemsDone(state, payload) {
    const counties = _.keyBy(payload.counties, item => `_${item.id}`);
    _.each(counties, county => {
        const distribution = _.find(
            payload.distribution,
            item =>
                item.jud_distributie.toLowerCase() ===
                county.denumire.toLowerCase()
        );
        if (distribution) {
            county.distribution = distribution;
        }
    });

    return {
        itemsById: counties,
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
