import api from '../../services/api';

export const types = {
    CLEAR_CACHE: 'leadImportTemplate.CLEAR_CACHE',
    FETCH_ITEMS_DONE: 'leadLogs.FETCH_ITEMS_DONE',
    SET_CURRENT_ITEM: 'leadLogs.SET_CURRENT_ITEM',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function setCurrentItem(item) {
    return {
        type: types.SET_CURRENT_ITEM,
        payload: { item },
    };
}

export function unsetCurrentItem() {
    return {
        type: types.SET_CURRENT_ITEM,
        payload: { item: null },
    };
}

export function create(data) {
    return async (dispatch, getState) => {
        await api.postJSON('/lead-import-template', { ...data });
    };
}

export function patch(id, data) {
    return async (dispatch, getState) => {
        await api.patchJSON(`/lead-import-template/${id}`, data);
    };
}

export function deleteItem(id) {
    return async (dispatch, getState) => {
        await api.delete(`/lead-import-template/${id}`);
    };
}

export function fetchItems() {
    return async (dispatch, getState) => {
        const result = await api.get('/lead-import-template?$limit=100');
        dispatch({
            type: types.FETCH_ITEMS_DONE,
            payload: {
                items: result.data,
                total: result.total,
            },
        });
    };
}
