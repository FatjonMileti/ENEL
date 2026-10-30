import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'counties.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'counties.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const counties = await api.get('/judet');
        const distribution = await api.get('/judete-zd');

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                counties: counties.data,
                distribution: distribution.data,
            },
        });
    };
}
