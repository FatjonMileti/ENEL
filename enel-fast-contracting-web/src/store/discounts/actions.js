import api from '../../services/api';
import _ from 'lodash';
import { getFlow } from 'store/client/selectors';
import { getSession } from 'store/session/selectors';
import { CAMPAIGNS_CHANNEL } from 'utils/config';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'discounts.FETCH_ALL_ITEMS_DONE',
    CLEAR_CACHE: 'discounts.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const _flow = getFlow(getState()).toLowerCase();
        const _session = getSession(getState());

        const _serviciu = _session[`${_flow}_serviciu`];
        const _loc = _session[`${_flow}_loc`];

        const denumire = _serviciu.denumire;
        const tip = _serviciu.tip;
        const segment = _serviciu.seg;
        const canal = CAMPAIGNS_CHANNEL;
        const judet = _loc.judet;
        const cityId = _loc.strada;
        const scadenta = _session.scadenta_factura;
        const PenaltyAndGracePeriod = null;
        const POD = _loc.cod_pod;
        const CNP = _session.client.cnp;
        const serviciu = _flow.toUpperCase();
        const sw_titular = _session[`${_flow}_schimba_titular`];
        const sw_furnizor = _session[`${_flow}_schimba_furnizor`];
        const furnizare = _session[`${_flow}_are_furnizare_activa`];

        let req = {
            denumire,
            tip,
            segment,
            canal,
            judet,
            cityId,
            scadenta,
            POD,
            CNP,
            serviciu,
            sw_titular,
            sw_furnizor,
            furnizare,
        };
        if (PenaltyAndGracePeriod) req.PenaltyAndGracePeriod = PenaltyAndGracePeriod;

        const result = await api.get('/discount', req);

        let discounts = [];
        for (const discount of result) {
            if (discount.DiscountID) discounts.push(discount);
        }

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: discounts,
            },
        });
    };
}
