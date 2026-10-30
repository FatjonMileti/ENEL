import api from '../../services/api';
import { getFlow } from '../client/selectors';
import { getSession } from '../session/selectors';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'invoiceExamples.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'invoiceExamples.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const state = getState();
        const flow = getFlow(state);
        const session = getSession(state);

        const provider = session[`${flow.toLowerCase()}_furnizor_actual`];
        const county = session.judet;

        let result = await api.get('/invoice-examples', {
            type: flow,
            furnizor_id: provider,
            county,
        });

        if (!result.data || !result.data.length) {
            result = await api.get('/invoice-examples', {
                type: flow,
                furnizor_id: provider,
                county: '',
            });
        }

        if (!result.data || !result.data.length) {
            result = await api.get('/invoice-examples', {
                type: flow,
                furnizor_id: '',
                county,
            });
        }

        if (!result.data || !result.data.length) {
            result = await api.get('/invoice-examples', {
                type: flow,
                furnizor_id: '',
                county: '',
            });
        }

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.data,
            },
        });
    };
}
