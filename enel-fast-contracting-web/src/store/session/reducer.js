import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

import offerService from 'services/offer';

const initialState = Immutable({
    step: 1,
    completed: {
        ee: false,
        gaz: false,
    },
    data: {},
});

function clearCache(state) {
    state = initialState;
    return state;
}

function patchSession(state, payload) {
    return state.merge({ data: payload.session }, { deep: true });
}

function setStep(state, step) {
    return state.merge({ step });
}

function restoreSession(state, payload) {
    return state.merge({ data: payload.data, step: payload.step });
}

function setCompleted(state, payload) {
    return state.merge({
        completed: {
            [payload.flow]: true,
        },
    });
}

function setProvider(state, payload) {
    return state.merge({
        data: {
            [`${payload.flow}_are_furnizare_activa`]: true,
            [`${payload.flow}_furnizor_actual`]: payload.providerId,
            [`${payload.flow}_loc`]: {
                furnizor_id: payload.providerId,
            },
        },
    }, { deep: true });
}

function unsetProvider(state, payload) {
    return state.merge({
        data: {
            [`${payload.flow}_are_furnizare_activa`]: false,
            [`${payload.flow}_furnizor_actual`]: '',
            [`${payload.flow}_loc`]: {
                furnizor_id: '',
            },
        },
    }, { deep: true });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.SET_STEP:
            return setStep(state, action.payload);

        case types.SET_COMPLETED:
            return setCompleted(state, action.payload);

        case types.SET_PROVIDER:
            return setProvider(state, action.payload);

        case types.UNSET_PROVIDER:
            return unsetProvider(state, action.payload);

        case types.PATCH:
            return patchSession(state, action.payload);

        case types.RESTORE_SESSION:
            return restoreSession(state, action.payload);

        default:
            return state;
    }
}
