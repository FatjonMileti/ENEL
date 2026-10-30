import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'companies.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'companies.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems(county) {
    return async (dispatch, getState) => {
        const result = await api.get('/canal?$sort[denumire]=1&$limit=10000');
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
