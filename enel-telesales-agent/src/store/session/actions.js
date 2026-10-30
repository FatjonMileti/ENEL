import api from '../../services/api';
import _ from 'lodash';

import { getSession, getFlow } from 'store/session/selectors';
import { getSkip, getLimit } from 'store/session/selectors';
import { getDateFilters, getFilters } from 'store/ui/selectors';

import offerService from 'services/offer';
import filters from 'services/filters';

export const types = {
    CLEAR_CACHE: 'session.CLEAR_CACHE',
    CLEAR_LIST: 'session.CLEAR_LIST',
    CLEAR_SELECTION: 'session.CLEAR_SELECTION',
    CLEAR_DATA: 'session.CLEAR_DATA',
    CREATE: 'session.CREATE',
    PATCH: 'session.PATCH',
    RESTORE_SESSION: 'session.RESTORE_SESSION',
    SET_STEP: 'session.SET_STEP',
    SET_CONTRACT_TYPE: 'session.SET_CONTRACT_TYPE',
    SET_PROVIDER: 'session.SET_PROVIDER',
    UNSET_PROVIDER: 'session.UNSET_PROVIDER',
    FETCH_ITEMS_DONE: 'session.FETCH_ITEMS_DONE',
    FETCH_ITEM_DONE: 'session.FETCH_ITEM_DONE',
    TOGGLE_ALL_SELECTED: 'session.TOGGLE_ALL_SELECTED',
    TOGGLE_ITEM_SELECTED: 'session.TOGGLE_ITEM_SELECTED',
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

export function clearData() {
    return {
        type: types.CLEAR_DATA,
    };
}

export function reset() {
    return {
        type: types.RESET,
    };
}

export function setStep(step) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.SET_STEP,
            payload: step,
        });
    };
}

export function setContractType(contractType) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.SET_CONTRACT_TYPE,
            payload: contractType,
        });
    };
}

export function setProvider(providerId) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());

        dispatch({
            type: types.SET_PROVIDER,
            payload: { flow: flow.toLowerCase(), providerId },
        });
    };
}

export function unsetProvider() {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());

        dispatch({
            type: types.UNSET_PROVIDER,
            payload: { flow: flow.toLowerCase() },
        });
    };
}

export function bulkPatch(data, ids) {
    return async (dispatch, getState) => {
        if (ids && ids.length >= 1) {
            if (ids.length === 1) ids.push(ids[0]);
            const idFilters = ids.map(id => `id[$in]=${id}`).join('&');
            await api.patchJSON(`/session?${idFilters}`, data);
        } else {
            const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
            const mainFilters = filters.buildFilters(getFilters(getState()));
            await api.patchJSON(`/session?${dateFilters}${mainFilters}`, data);
        }
    };
}

export function patch(values) {
    return async (dispatch, getState) => {
        const data = _.cloneDeep(values);
        const flow = getFlow(getState());

        _.each(data, (value, key) => {
            if (key[0] === '_') {
                if (flow) {
                    data[`${flow.toLowerCase()}${key}`] = value;
                } else {
                    data[`ee${key}`] = value;
                    data[`gaz${key}`] = value;
                }
                delete data[key];
            }
        });

        dispatch({
            type: types.PATCH,
            payload: {
                session: data,
            },
        });
        const session = getSession(getState());
        await api.patchJSON(`/session/${session.id}`, session);
    };
}

export function create() {
    return async (dispatch, getState) => {
        const result = await api.post('/session', {});
        dispatch({
            type: types.PATCH,
            payload: {
                session: {
                    id: result.id,
                    hash: result.hash,
                    status: result.status,
                    link_sent_date: result.link_sent_date,
                    client_upload_agree_date: result.client_upload_agree_date,
                },
            },
        });
    };
}

export function restore({ id, hash }) {
    return async (dispatch, getState) => {
        const result = await api.get(`/restore-session/${id}?hash=${hash}`);

        if (_.isEmpty(result.session.gaz_consum)) {
            result.session.gaz_consum = null;
        }

        dispatch({
            type: types.RESTORE_SESSION,
            payload: {
                data: result.session,
            },
        });
    };
}

export function createOffer(flow, channel) {
    return async (dispatch, getState) => {
        const session = getSession(getState());

        await api.patchJSON(`/session/${session.id}`, session);
        const result = await api.post(`/offer?sessionId=${session.id}&type=${flow}`);

        dispatch({
            type: types.PATCH,
            payload: {
                session: {
                    internal_id: result.internal_id,
                },
            },
        });
    };
}

export function signOffer(flow, channel) {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        await api.post(`/sign?sessionId=${session.id}&type=${flow}&contact=${channel}`);
    };
}

export function acceptOffer() {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const flow = getFlow(getState()).toUpperCase();

        await api.post(`/activate?sessionId=${session.id}&type=${flow}`);
    };
}

export function rejectOffer(sessionId, flow, reason) {
    return async (dispatch, getState) => {
        if (reason) {
            await api.patchJSON(`/session/${sessionId}`, {
                abandon_type: 'AGENT_REJECT',
                abandon_details: reason,
            });
        }
        await api.delete(`/activate?sessionId=${sessionId}&type=${flow}&forceUpdate=true`);
    };
}

export function setOptions(info) {
    return async (dispatch, getState) => {
        const session = getSession(getState());

        const options = {
            perioada_furnizare: parseInt(info.furn24) ? 24 : 12,
            scadenta_factura: session.contract_type === 'b2b' ? 15 : 15,
        };

        dispatch({
            type: types.PATCH,
            payload: {
                session: options,
            },
        });
        await api.patchJSON(`/session/${session.id}`, session);
    };
}

export function setPlan(plan) {
    return async (dispatch, getState) => {
        const options = {
            ee_serviciu: _.find(plan, offer => offer.serviciu === 'EE') || null,
            gaz_serviciu: _.find(plan, offer => offer.serviciu.toUpperCase() === 'GAZ') || null,
            type: offerService.getPlanDetails(plan).serviciu,
        };

        dispatch({
            type: types.PATCH,
            payload: {
                session: options,
            },
        });

        const session = getSession(getState());
        await api.patchJSON(`/session/${session.id}`, session);
    };
}

export function fetchItems() {
    return async (dispatch, getState) => {
        const skip = getSkip(getState());
        const limit = getLimit(getState());
        const dateFilters = filters.buildDateFilters(getDateFilters(getState()), 'createdAt');
        const mainFilters = filters.buildFilters(getFilters(getState()));
        const result = await api.get(
            `/session?$limit=${limit}&$skip=${skip}&$sort[id]=-1${dateFilters}${mainFilters}`
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
        const result = await api.get(`/session?id=${id}`);
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
