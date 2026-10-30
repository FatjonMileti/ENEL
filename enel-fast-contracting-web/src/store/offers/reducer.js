import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    params: {},
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
});

function clearCache(state) {
    return state.merge(initialState);
}

function setParams(state, payload) {
    return state.merge({
        params: payload.params,
    });
}

function setOptions(state, payload) {
    return state.merge({
        options: payload.options,
    });
}

function setCurrentPlan(state, payload) {
    const currentPlan = {};
    const eeOffer = _.find(payload.offers, offer => offer.serviciu === 'EE');
    const gazOffer = _.find(payload.offers, offer => offer.serviciu === 'GAZ');

    if (eeOffer) currentPlan.eeOffer = eeOffer;
    if (gazOffer) currentPlan.gazOffer = gazOffer;

    return state.merge({
        currentPlan,
    });
}

function fetchAllItemsDone(state, payload) {
    let i = 0;
    let items;

    if (payload.type === 'EE') {
        items = {
            eeItemsById: _.keyBy(payload.items, () => `_${++i}`),
            gazItemsById: {}
        };
    } else if (payload.type === 'GAZ') {
        items = {
            gazItemsById: _.keyBy(payload.items, () => `_${++i}`),
            eeItemsById: {}
        };
    } else {
        items = {
            comboItemsById: _.keyBy(payload.items, () => `_${++i}`),
        };
    }

    return state.merge(items);
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR_CACHE:
    case 'RESET_SESSION':
        return clearCache(state);

    case types.FETCH_ALL_ITEMS_DONE:
        return fetchAllItemsDone(state, action.payload);

    case types.SET_OPTIONS:
        return setOptions(state, action.payload);

    case types.SET_PARAMS:
        return setParams(state, action.payload);

    case types.SET_CURRENT_PLAN:
        return setCurrentPlan(state, action.payload);

    default:
        return state;
    }
}
