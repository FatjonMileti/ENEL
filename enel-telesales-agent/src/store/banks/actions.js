import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'banks.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'banks.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const result = await api.get('/banca?$limit=10000');
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
