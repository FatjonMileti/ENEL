import api from '../../services/api';
import { getFlow, getSession } from 'store/session/selectors';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'campaigns.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'campaigns.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const flow = getFlow(getState()).toLowerCase();
        const session = getSession(getState());
        const invoice = session[`${flow}_factura`];
        const offer = session[`${flow}_serviciu`];

        const result = await api.get('/campaign', {
            canal: '4',
            segment: 'CASNIC',
            serviciu: flow.toUpperCase(),
            ebill: !invoice || invoice.mod_corespondenta !== 'MAIL' ? '0' : '1',
            id_var_pret: offer.cod,
        });

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: result.varianteConcursuri,
            },
        });
    };
}
