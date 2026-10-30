import api from '../../services/api';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'leadLogs.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'leadLogs.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems(leadId) {
    return async (dispatch, getState) => {
        const result = await api.get(`/lead-logs?$limit=10000&leadId=${leadId}&$sort[id]=-1`);
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
