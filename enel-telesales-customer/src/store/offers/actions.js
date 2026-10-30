import api from '../../services/api';
import _ from 'lodash';

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
        const result = await api.get(
            '/variante-pret',
            _.assign(params, {
                serviciu: type,
                scadenta: '15',
                canal: '6',
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
