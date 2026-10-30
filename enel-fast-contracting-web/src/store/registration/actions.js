import api from '../../services/api';
import _ from 'lodash';
import { toRegistrationEmailData } from 'utils/serializers';
import { REGISTRATION_EMAIL_TYPES } from 'utils/constants/app';

export const types = {
    CREATE_REGISTRATION_NUMBER_DONE: 'registration.CREATE_REGISTRATION_NUMBER_DONE',
    RESET_REGISTRATION: 'registration.RESET_REGISTRATION',
    SAVE_REGISRATION_URL: 'registration.SAVE_REGISRATION_URL',
};

export function resetRegistration() {
    return {
        type: types.RESET_REGISTRATION,
    };
}

export function createRegistrationNumber(data) {
    return async (dispatch, getState) => {
        const result = await api.postJSON('/lead-start-crm', data);
        const id = result.generic_dossier_id;
        const name = result.generic_dossier_name;
        await api.postJSON('/lead-start-email/', toRegistrationEmailData(data, id, REGISTRATION_EMAIL_TYPES.CREATE));

        dispatch({
            type: types.CREATE_REGISTRATION_NUMBER_DONE,
            payload: {
                registrationNumber: id,
                registrationName: name,
            },
        });
    };
}

export function updateRegistrationInfo(data, registrationId) {
    return async (dispatch, getState) => {
        await api.patchJSON(`/lead-start-crm/${registrationId}`, data);
    };
}

export function sendRegistrationEmail(data) {
    return async (dispatch, getState) => {
        await api.postJSON('/lead-start-email/', data);
    };
}

export function saveRegistrationPageURL(url) {
    return {
        type: types.SAVE_REGISRATION_URL,
        payload: {
            url,
        },
    };
}
