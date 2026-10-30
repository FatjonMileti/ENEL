import _ from 'lodash';

export function getSession(state) {
    return state.session.data;
}

export function getStep(state) {
    return state.session.step;
}

export function isCompleted(state, flow) {
    return state.session.completed[flow];
}

export function isBackoffice(state, flow) {
    return getSession(state).backoffice;
}

export function hasParam(state, param) {
    return !!state.session.data[param];
}
