import api from '../../services/api';
import _ from 'lodash';
import { getFlow } from 'store/client/selectors';
import { getSession } from 'store/session/selectors';
import { CAMPAIGNS_CHANNEL, CAMPAIGNS_SEGMENT } from 'utils/config';

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
            canal: CAMPAIGNS_CHANNEL || '',
            segment: CAMPAIGNS_SEGMENT || '',
            serviciu: flow.toUpperCase(),
            ebill: invoice.mod_corespondenta == 'MAIL' ? '1' : '0',
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
