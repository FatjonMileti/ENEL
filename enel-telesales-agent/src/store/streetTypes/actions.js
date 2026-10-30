import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'streetTypes.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'streetTypes.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems(judet) {
    return async (dispatch, getState) => {
        const result = await api.get('/artera');
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
