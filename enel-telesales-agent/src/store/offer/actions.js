export const types = {
    SET_OFFER_DETAILS: 'offer.SET_OFFER_DETAILS',
    SET_OFFER_CITY: 'offer.SET_OFFER_CITY',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function setOffers(offers) {
    return {
        type: types.SET_OFFER_DETAILS,
        payload: offers,
    };
}

export function setCityOffers(city) {
    return {
        type: types.SET_OFFER_CITY,
        payload: city,
    };
}
