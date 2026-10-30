import { types } from './actions';

const initialState = {
    itemsByLeadId: {},
};

// Clear cached info
function clearCache(state) {
    return initialState;
}

// Save items to store
function fetchAllItemsDone(state, payload) {
    if (payload.items[0]) {
        return {
            ...state,
            itemsByLeadId: {
                ...state.itemsByLeadId,
                [`_${payload.items[0].leadId}`]: payload.items,
            },
        };
    }

    return state;
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
