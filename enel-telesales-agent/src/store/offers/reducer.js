import { types } from './actions';
import _ from 'lodash';

const initialState = {
    eeItemsById: {
        // _id: {item_details}
    },
    gazItemsById: {
        // _id: {item_details}
    },
    comboItemsById: {
        // _id: {item_details}
    },
    currentPlan: {
        eeOffer: null,
        gazOffer: null,
    },
};

function clearCache(state) {
    return {
        eeItemsById: {},
        gazItemsById: {},
        comboItemsById: {},
        currentPlan: {
            eeOffer: null,
            gazOffer: null,
        },
    };
}

function setOptions(state, payload) {
    return {
        ...state,
        options: payload.options,
    };
}

function setCurrentPlan(state, payload) {
    const currentPlan = {};
    const eeOffer = _.find(payload.offers, offer => offer.serviciu === 'EE');
    const gazOffer = _.find(payload.offers, offer => offer.serviciu.toUpperCase() === 'GAZ');

    if (eeOffer) {
        currentPlan.eeOffer = eeOffer;
    }
    if (gazOffer) {
        currentPlan.gazOffer = gazOffer;
    }

    return {
        ...state,
        currentPlan,
    };
}

function fetchAllItemsDone(state, payload) {
    let i = 0;

    if (payload.type === 'EE') {
        return {
            ...state,
            eeItemsById: _.keyBy(payload.items, () => `_${++i}`),
        };
    } else if (payload.type === 'GAZ') {
        return {
            ...state,
            gazItemsById: _.keyBy(payload.items, () => `_${++i}`),
        };
    } else {
        return {
            ...state,
            comboItemsById: _.keyBy(payload.items, () => `_${++i}`),
        };
    }
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case 'RESET_SESSION':
        case types.CLEAR_CACHE:
            return clearCache(state);

        case types.FETCH_ALL_ITEMS_DONE:
            return fetchAllItemsDone(state, action.payload);

        case types.SET_OPTIONS:
            return setOptions(state, action.payload);

        case types.SET_CURRENT_PLAN:
            return setCurrentPlan(state, action.payload);

        default:
            return state;
    }
}
