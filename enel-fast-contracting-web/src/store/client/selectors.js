import _ from 'lodash';

export function getClient(state) {
    return state.client.info;
}

export function getNLC(state) {
    return state.client.nlc;
}

export function getNLCValidation(state) {
    return state.client.nlcValidation;
}

export function getFlow(state) {
    return state.client ? state.client.flow : '';
}

export function getOptions(state) {
    return state.client.options;
}

export function getError(state) {
    return state.client ? state.client.error : '';
}

export function hasEmail(state) {
    return state.client ? state.client.hasEmail : false;
}

export function getStartDate(state) {
    return state.client.startDate;
}