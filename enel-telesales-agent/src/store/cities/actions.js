import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'cities.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'cities.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems(county) {
    return async (dispatch, getState) => {
        const result = await api.get(
            `/localitate?$limit=10000&judet=${county}`
        );
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
