/* eslint-disable linebreak-style */
import api from '../../services/api';
import { getFlow, getSession } from 'store/session/selectors';
import { getUser } from 'store/auth/selectors';

const USER_TYPE = Object.freeze({
    AGENT: 'vi',
    OFFICER: 'pe',
    WEB: 'web',
    INFOKIOSK: 'ik',
    CALLCENTER: 'cc',
});

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

        // const denumire = _serviciu?.denumire;
        const denumire = _serviciu !== undefined ? _serviciu.denumire : null;
        // const denumire = childExist(_serviciu, 'denumire');
        // const tip = _serviciu?.tip;
        const tip = _serviciu !== undefined ? _serviciu.tip : null;
        // const segment = _serviciu?.seg;
        const segment = _serviciu !== undefined ? _serviciu.seg : null;

        const user = getUser(getState());
        let channel = 2;
        if (user.type === USER_TYPE.CALLCENTER) {
            channel = 4;
        } else if (user.type === USER_TYPE.OFFICER && user.employed) {
            channel = 3;
        } else if (user.type === USER_TYPE.INFOKIOSK && user.employed) {
            channel = 5;
        } else if (user.type === USER_TYPE.WEB) {
            channel = 6;
        }

        const canal = channel;
        // const judet = _loc?.judet;
        const judet = _loc !== undefined ? _loc.judet : null;
        // const cityId = _loc?.strada;
        const cityId = _loc !== undefined ? _loc.strada : null;
        const scadenta = _session.scadenta_factura;
        const PenaltyAndGracePeriod = null;
        // const POD = _loc?.cod_pod;
        const POD = _loc !== undefined ? _loc.cod_pod : null;
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
