import api from '../../services/api';

export const types = {
    CLEAR_CACHE: 'reminder.CLEAR_CACHE',
    FETCH_ITEMS_DONE: 'reminder.FETCH_ITEMS_DONE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchItems() {
    return async (dispatch, getState) => {
        const result = await api.get(`/reminder?$limit=${1000}&$sort[id]=-1`);

        dispatch({
            type: types.FETCH_ITEMS_DONE,
            payload: {
                items: result.data,
                total: result.total,
            },
        });
    };
}

export function createItem(data) {
    return async (dispatch, getState) => {
        await api.postJSON('/reminder', data);
    };
}

export function patch(id, data) {
    return async (dispatch, getState) => {
        await api.patchJSON(`/reminder/${id}`, data);
    };
}
