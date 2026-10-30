import api from '../../services/api';
import _ from 'lodash';

import { getUser } from 'store/auth/selectors';

const USER_TYPE = Object.freeze({
    AGENT: 'vi',
    OFFICER: 'pe',
    WEB: 'web',
    INFOKIOSK: 'ik',
    CALLCENTER: 'cc',
});

export const types = {
    FETCH_ALL_ITEMS_DONE: 'offers.FETCH_ALL_ITEMS_DONE',
    SET_CURRENT_PLAN: 'offers.SET_CURRENT_PLAN',
    CLEAR_CACHE: 'offers.CLEAR_CACHE',
    SET_OPTIONS: 'offers.SET_OPTIONS',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function fetchItems(params, type) {
    return async (dispatch, getState) => {
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

        const result = await api.get(
            '/variante-pret',
            _.assign(params, {
                serviciu: type,
                scadenta: params.segment === 'BUSINESS' ? '15' : '15',
                // scadenta: params.segment === 'BUSINESS' ? '30' : '15',
                canal: channel,
            })
        );

        dispatch({
            type: types.FETCH_ALL_ITEMS_DONE,
            payload: {
                items: type === 'COMBO' ? result : result.variantePreturi,
                type,
            },
        });
    };
}

export function setCurrentPlan(offers) {
    return {
        type: types.SET_CURRENT_PLAN,
        payload: {
            offers,
        },
    };
}

export function unsetCurrentPlan() {
    return {
        type: types.SET_CURRENT_PLAN,
        payload: {
            offers: [],
        },
    };
}
