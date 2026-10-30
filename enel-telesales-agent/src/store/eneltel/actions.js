/* eslint-disable linebreak-style */
import api from '../../services/api';
import { getFlow, getSession } from 'store/session/selectors';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'eneltel.FETCH_ALL_ITEMS_DONE',
    VALIDATE: 'eneltel.VALIDATE',
    CLEAR_CACHE: 'eneltel.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function validateEneltel(eneltelCode) {
    return async (dispatch, getState) => {
        const req = {
            eneltel: eneltelCode,
        };
        const result = await api.get('/validate-eneltel', req);
        dispatch({
            type: types.VALIDATE,
            payload: { item: result.data },
        });
    };
}

export function fetchAllItems(index) {
    return async (dispatch, getState) => {
        const _session = getSession(getState());
        const friendsInVoucher = _session.vouchers[index].friends;
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: friendsInVoucher,
            },
        });
    };
}
