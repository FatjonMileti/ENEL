import { types } from './actions';

const initialState = {
    offerDetails: [],
    city: null,
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
        offerDetails: [],
        city: null,
    };
}

function setOfferDetails(state, payload) {
    return {
        ...state,
        offerDetails: payload,
    };
}

function setOfferCity(state, payload) {
    return {
        ...state,
        city: payload,
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case 'RESET_SESSION':
        case types.CLEAR_CACHE:
            return clearCache(state);

        case types.SET_OFFER_DETAILS:
            return setOfferDetails(state, action.payload);
        case types.SET_OFFER_CITY:
            return setOfferCity(state, action.payload);
        default:
            return state;
    }
}
