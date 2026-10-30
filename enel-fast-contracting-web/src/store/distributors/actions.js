import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'distributors.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'distributors.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const result = await api.get('/distribuitor?$limit=100');
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
