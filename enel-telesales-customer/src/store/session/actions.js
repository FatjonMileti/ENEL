import api from '../../services/api';
import _ from 'lodash';

import { getSession } from 'store/session/selectors';

export const types = {
    CLEAR_CACHE: 'session.CLEAR_CACHE',
    PATCH: 'session.PATCH',
    RESET: 'RESET_SESSION',
    RESTORE_SESSION: 'session.RESTORE_SESSION',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function reset() {
    return {
        type: types.RESET,
    };
}

export function patch(values) {
    return async (dispatch, getState) => {
        const data = _.cloneDeep(values);

        dispatch({
            type: types.PATCH,
            payload: {
                session: data,
            },
        });

        const session = { ...getSession(getState()) };
        delete session.ee_serviciu;
        delete session.gaz_serviciu;
        await api.patchJSON(`/session/${session.id}`, session);
    };
}

export function restore({ id, hash }) {
    return async (dispatch, getState) => {
        const result = await api.get(`/restore-session/${id}?hash=${hash}`);
        dispatch({
            type: types.RESTORE_SESSION,
            payload: {
                data: result.session,
            },
        });
    };
}

export function acceptOffer(flow) {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const contact = session.ee_contact || session.gaz_contact;
        const channel = contact.telefon ? 'SMS' : 'EMAIL';
        await api.post(
            `/activate?sessionId=${session.id}&type=${flow.toUpperCase()}&contact=${channel}`
        );
    };
}

export function rejectOffer(flow) {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        await api.delete(`/activate?sessionId=${session.id}&type=${flow.toUpperCase()}`);
    };
}
