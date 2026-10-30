import _ from 'lodash';
import offerService from 'services/offer';

export function getItems(state, type) {
    if (type === 'EE') {
        return state.offers.eeItemsById;
    } else if (type === 'GAZ') {
        return state.offers.gazItemsById;
    }

    return state.offers.comboItemsById;
}

export function getParams(state) {
    return state.offers.params;
}

export function hasParams(state) {
    return !_.isEmpty(state.offers.params);
}

export function getCurrentPlan(state) {
    return state.offers.currentPlan;
}

export function getPlanType(state) {
    if (getCurrentPlan(state).eeOffer || getCurrentPlan(state).gazOffer) {
        const plan = offerService.getPlanDetails(getCurrentPlan(state));
        return plan.serviciu.toUpperCase();
    }
}

export function isPlanSelected(state) {
    return getCurrentPlan(state).eeOffer || getCurrentPlan(state).gazOffer;
}

export function isCombo(state) {
    return getPlanType(state) === 'COMBO';
}
