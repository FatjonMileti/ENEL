import api from '../../services/api';

import { getLimit, getSkip } from 'store/leads/selectors';
import { getDateFilters, getFilters, getSearchFilter } from 'store/ui/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';

import filters from 'services/filters';
import auth from 'services/auth';

import { getImportKey, getImportSubkeys, LEAD_STATUS } from 'services/lead';
import { ROLES } from 'services/user';

export const types = {
    CLEAR_CACHE: 'leads.CLEAR_CACHE',
    CLEAR_LIST: 'leads.CLEAR_LIST',
    CLEAR_SELECTION: 'leads.CLEAR_SELECTION',
    FETCH_ITEMS_DONE: 'leads.FETCH_ITEMS_DONE',
    FETCH_ITEM_DONE: 'leads.FETCH_ITEM_DONE',
    SET_IMPORT_ITEMS: 'leads.SET_IMPORT_ITEMS',
    SET_IMPORT_SKIP: 'leads.SET_IMPORT_SKIP',
    SET_EDIT_TOTAL: 'leads.SET_EDIT_TOTAL',
    SET_TOTAL_UPDATED: 'leads.SET_TOTAL_UPDATED',
    TOGGLE_ALL_SELECTED: 'leads.TOGGLE_ALL_SELECTED',
    TOGGLE_ITEM_SELECTED: 'leads.TOGGLE_ITEM_SELECTED',
    BULK_EDIT_IMPORT: 'leads.BULK_EDIT_IMPORT',
    CANCEL_IMPORT: 'leads.CANCEL_IMPORT',
    SET_IMPORT_ERROR: 'leads.SET_IMPORT_ERROR',
    UNSET_IMPORT_ERRORS: 'leads.UNSET_IMPORT_ERRORS',
    REMOVE_IMPORTED_ITEM: 'leads.REMOVE_IMPORTED_ITEM',
    REFRESH_IMPORT_TOTAL: 'leads.REFRESH_IMPORT_TOTAL',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function clearList() {
    return {
        type: types.CLEAR_LIST,
    };
}

export function clearSelection() {
    return {
        type: types.CLEAR_SELECTION,
    };
}

export function countEditItems() {
    return async (dispatch, getState) => {
        const searchFilters = filters.buildSearchFilters(getSearchFilter(getState()));
        const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
        const mainFilters = filters.buildFilters(getFilters(getState()));

        const invalidStatuses = [
            LEAD_STATUS.INTERMEDIARY,
            LEAD_STATUS.FINAL,
            LEAD_STATUS.CUSTOMER,
            LEAD_STATUS.LOST_SALE,
        ];

        const setFilters = getFilters(getState());
        const authUser = getAuthUser(getState());
        let canEditFilters = invalidStatuses.map(status => `status[$nin]=${status}`).join('&');

        if (authUser.role) {
            if (![ROLES.LMA, ROLES.LSA].includes(authUser.role)) {
                canEditFilters = '';
            } else if (setFilters.leadStatus) {
                if (invalidStatuses.includes(setFilters.leadStatus)) {
                    return dispatch({
                        type: types.SET_EDIT_TOTAL,
                        payload: {
                            editTotal: 0,
                        },
                    });
                } else {
                    canEditFilters = '';
                }
            }

            const result = await api.get(
                `/leads?$limit=0&${searchFilters}${dateFilters}${mainFilters}&${canEditFilters}`
            );

            dispatch({
                type: types.SET_EDIT_TOTAL,
                payload: {
                    editTotal: result.total,
                },
            });
        }
    };
}

export function fetchItems() {
    return async (dispatch, getState) => {
        const skip = getSkip(getState());
        const limit = getLimit(getState());
        const searchFilters = filters.buildSearchFilters(getSearchFilter(getState()));
        const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
        const mainFilters = filters.buildFilters(getFilters(getState()));
        const result = await api.get(
            `/leads?$limit=${limit}&$skip=${skip}&$sort[id]=-1${searchFilters}${dateFilters}${mainFilters}`
        );

        dispatch({
            type: types.FETCH_ITEMS_DONE,
            payload: {
                items: result.data,
                skip,
                total: result.total,
            },
        });
    };
}

export function fetchItem(id) {
    return async (dispatch, getState) => {
        const result = await api.get(`/leads?id=${id}`);
        if (result.data && result.data.length) {
            dispatch({
                type: types.FETCH_ITEM_DONE,
                payload: {
                    item: result.data[0],
                },
            });
        }
    };
}

export function bulkPatch(data, ids, limit) {
    return async (dispatch, getState) => {
        let result;
        if (ids && ids.length === 1) {
            result = await api.patchJSON(`/leads/${ids[0]}`, data);
        } else if (ids && ids.length > 1) {
            const idFilters = ids.map(id => `id[$in]=${id}`).join('&');
            result = await api.patchJSON(`/leads?${idFilters}`, data);
        } else {
            const searchFilters = filters.buildSearchFilters(getSearchFilter(getState()));
            const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
            const mainFilters = filters.buildFilters(getFilters(getState()));
            const limitParam = limit ? `&$limit=${limit}&$sort[id]=-1` : '';
            result = await api.patchJSON(
                `/leads?${searchFilters}${dateFilters}${mainFilters}${limitParam}`,
                data
            );
        }
        dispatch({
            type: types.SET_TOTAL_UPDATED,
            payload: {
                totalUpdated: result.totalUpdated !== undefined ? result.totalUpdated : 1,
            },
        });
    };
}

export function bulkDelete(ids, limit) {
    return async (dispatch, getState) => {
        if (ids && ids.length === 1) {
            await api.delete(`/leads/${ids[0]}`);
        } else if (ids && ids.length > 1) {
            const idFilters = ids.map(id => `id[$in]=${id}`).join('&');
            await api.delete(`/leads?${idFilters}`);
        } else {
            const searchFilters = filters.buildSearchFilters(getSearchFilter(getState()));
            const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
            const mainFilters = filters.buildFilters(getFilters(getState()));
            const limitParam = limit ? `&$limit=${limit}&$sort[id]=-1` : '';
            await api.delete(`/leads?${searchFilters}${dateFilters}${mainFilters}${limitParam}`);
        }
    };
}

export function reportExport(data) {
    return async (dispatch, getState) => {
        const searchFilters = filters.buildSearchFilters(getSearchFilter(getState()));
        const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
        const mainFilters = filters.buildFilters(getFilters(getState()));
        const accessToken = await auth.getAccessToken();

        let url = `${process.env.REACT_APP_API_URL}/excel-leads?accessToken=${accessToken.value}${searchFilters}${dateFilters}${mainFilters}`;
        window.open(url);
    };
}

export function patch(data) {
    return async (dispatch, getState) => {
        await api.patchJSON(`/leads/${data.id}`, data);
    };
}

export function create(data) {
    const body = { data, key: getImportKey(data), subkeys: getImportSubkeys(data) };
    return async (dispatch, getState) => {
        await api.postJSON('/leads/', body);
    };
}

export function setImportError(data, error) {
    return async (dispatch, getState) => {
        const payload = {
            data,
            error,
        };

        dispatch({
            type: types.SET_IMPORT_ERROR,
            payload,
        });
        return error;
    };
}

export function unsetImportErrors(data, error) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.UNSET_IMPORT_ERRORS,
        });
    };
}

export function bulkEditImport(data) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.BULK_EDIT_IMPORT,
            payload: {
                data,
                filters: getFilters(getState()),
                searchFilter: getSearchFilter(getState()),
            },
        });
    };
}

export function cancelImport(data) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.CANCEL_IMPORT,
        });
    };
}

export function setImportItems(items) {
    items.forEach(item => (item.status = LEAD_STATUS.PROSPECT));
    return {
        type: types.SET_IMPORT_ITEMS,
        payload: {
            items,
        },
    };
}

export function setImportSkip(skip) {
    return {
        type: types.SET_IMPORT_SKIP,
        payload: {
            skip,
        },
    };
}

export function unsetTotalUpdated() {
    return {
        type: types.SET_TOTAL_UPDATED,
        payload: {
            totalUpdated: null,
        },
    };
}

export function removeImportedItem(item) {
    return {
        type: types.REMOVE_IMPORTED_ITEM,
        payload: {
            item,
        },
    };
}

export function refreshImportTotal() {
    return {
        type: types.REFRESH_IMPORT_TOTAL,
    };
}

export function toggleAllSelected(e) {
    return {
        type: types.TOGGLE_ALL_SELECTED,
    };
}

export function toggleItemSelected(item) {
    return {
        type: types.TOGGLE_ITEM_SELECTED,
        payload: {
            item,
        },
    };
}
