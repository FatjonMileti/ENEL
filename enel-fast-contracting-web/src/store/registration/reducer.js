import Immutable from 'seamless-immutable';
import { resetRegistration, types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    registrationNumber: '',
    registrationPageURL: window.location.href,
    registrationName: '',
});

function clearCache(state) {
    return state.merge(initialState);
}

function createRegistrationNumberDone(state, payload) {
    return state.merge({
        registrationNumber: payload.registrationNumber,
        registrationName: payload.registrationName,
    });
}

function saveRegistrationPageURL(state, payload) {
    return state.merge({
        registrationPageURL: payload.url,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR_CACHE:
    case types.RESET_REGISTRATION:
        return clearCache(state);

    case types.CREATE_REGISTRATION_NUMBER_DONE:
        return createRegistrationNumberDone(state, action.payload);

    case types.SAVE_REGISRATION_URL:
        return saveRegistrationPageURL(state, action.payload);

    default:
        return state;
    }
}
