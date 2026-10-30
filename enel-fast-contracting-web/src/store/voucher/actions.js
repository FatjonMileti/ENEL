import api from '../../services/api';

export const types = {
    FETCH_ITEM_DONE: 'voucher.FETCH_ITEM_DONE',
    CLEAR_CACHE: 'voucher.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function validateVoucher(voucherCode, productCode, productName, segment, county, cityId, isFriend, eneltelCode) {
    return async (dispatch, getState) => {
        const eneltel = (eneltelCode != null && eneltelCode != undefined && eneltelCode != '') ? `&eneltel=${eneltelCode}` : ''
        const result = await api.get(`/voucher?voucherCode=${voucherCode}&productCode=${productCode}&productName=${productName}&segment=${segment}&county=${county}&cityId=${cityId}&isFriend=${isFriend}${eneltel}`);
        dispatch({
            type: types.FETCH_ITEM_DONE,
            payload: {
                voucher: result,
            },
        });
    };
}
