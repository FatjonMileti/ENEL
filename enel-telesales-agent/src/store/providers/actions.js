import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'providers.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'providers.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchItems(params) {
    return async (dispatch, getState) => {
        const result = await api.get('/furnizor?$limit=1000');

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
