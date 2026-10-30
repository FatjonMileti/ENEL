import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'streets.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'streets.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems(streetType, cityId) {
    return async (dispatch, getState) => {
        if (cityId) {
            const result = await api.get(`/strada?$limit=10000&localitate_id=${cityId}`);
            dispatch({
                type: types.FETCH_ALL_ITEMS_DONE,
                payload: {
                    items: result,
                },
            });
        }
    };
}
