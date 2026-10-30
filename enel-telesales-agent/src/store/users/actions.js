import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'users.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'users.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems(county) {
    return async (dispatch, getState) => {
        const result = await api.get(
            '/users?$select[]=id&$select[]=marca&$sort[marca]=1&$limit=10000'
        );
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
