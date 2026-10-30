import _ from 'lodash';

import auth from 'services/auth';
import api from 'services/api';
import { types as errorTypes } from 'store/exceptions/actions';

import { getUser } from 'store/auth/selectors';

export const types = {
    FETCH_USER_DONE: 'auth.FETCH_USER_DONE',
    CLEAR_CACHE: 'auth.CLEAR_CACHE',
};

export function login(user, password, code, pin) {
    return async dispatch => {
        try {
            dispatch({
                type: errorTypes.UNSET_INVALID_LOGIN,
            });
            await auth.fetchAccessToken(user, password, code, pin);
            if (pin) {
                dispatch(tryFetchUser());
            }
        } catch (error) {
            dispatch({
                type: errorTypes.SET_INVALID_LOGIN,
            });
        }
    };
}

export function tryFetchUser() {
    return async (dispatch, getState) => {
        const user = getUser(getState());
        if (_.isEmpty(user)) {
            const user = await api.get('/user-info');
            dispatch({
                type: types.FETCH_USER_DONE,
                payload: { user },
            });
        }
    };
}

export function logout() {
    return async () => {
        await auth.deleteAccessToken();
        window.location = '/login';
    };
}

export function resetPassword(username, contact) {
    return async () => {
        let contactType = 'phone';

        if (contact.includes('@')) {
            contactType = 'email';
        }

        try {
            await api.getNoToken(`/reset-password/?marca=${username}&${contactType}=${contact}`);
        } catch (err) {
            console.log('>>>ERR: ', err);
        }
        window.location = '/login';
    };
}
