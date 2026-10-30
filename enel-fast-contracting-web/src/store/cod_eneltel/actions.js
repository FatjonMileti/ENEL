import api from '../../services/api';

export const types = {
    FETCH_ITEMS_DONE: 'eneltel.FETCH_ITEMS_DONE',
    CLEAR_CACHE: 'eneltel.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function validateCodeEnel(codeEnel) {
    return async (dispatch, getState) => {
        const result = await api.get(`/validate-eneltel?$eneltel=${voucherCode}`);
        dispatch({
            type: types.FETCH_ITEMS_DONE,
            payload: {
                eneltel: result.data,
            },
        });
    };
}
