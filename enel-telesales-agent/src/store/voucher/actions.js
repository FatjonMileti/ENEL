/* eslint-disable linebreak-style */
import api from '../../services/api';
import { getFlow, getSession } from 'store/session/selectors';

export const types = {
    FETCH_ALL_ITEMS_DONE: 'voucher.FETCH_ALL_ITEMS_DONE',
    VALIDATE: 'voucher.VALIDATE',
    CLEAR_CACHE: 'voucher.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function validateVoucher(
    voucherCode,
    productCode,
    productName,
    segment,
    county,
    cityId,
    isFriend,
    eneltel
) {
    return async (dispatch, getState) => {
        const req = {
            voucherCode: voucherCode,
            productCode: productCode,
            productName: productName,
            segment: segment,
            county,
            cityId,
            isFriend,
            // eneltel,
        };
        if (eneltel) {
            req['eneltel'] = eneltel;
        }
        const result = await api.get('/voucher', req);
        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: { voucher: result },
        });
    };
}

export function fetchAllItems() {
    return async (dispatch, getState) => {
        const _flow = getFlow(getState()).toLowerCase();
        const _session = getSession(getState());

        const vouchers = _session.vouchers;

        // const result = await api.get(`/voucher?voucherCode=${}`, req);

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: vouchers,
            },
        });
    };
}
