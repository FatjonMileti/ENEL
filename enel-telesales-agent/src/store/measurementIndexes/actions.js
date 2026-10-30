import api from 'services/api';

export const types = {
    QUERY_INDEXES_DONE: 'indexes.QUERY_INDEXES_DONE',
    CLEAR_CACHE: 'indexes.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function queryIndexes(id) {
    return async (dispatch, getState) => {
        const result = await api.get('/sap-query-index?ENELID=' + id);
        dispatch({
            type: types.QUERY_INDEXES_DONE,
            payload: result,
        });
    };
}
