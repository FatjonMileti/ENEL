import api from '../../services/api';
import _ from 'lodash';

export const types = {
    FETCH_DATA_DONE: 'salesforce.FETCH_DATA_DONE',
    SET_DATA: 'salesforce.SET_DATA',
    CLEAR_CACHE: 'salesforce.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function searchData(type, code) {
    return async (dispatch, getState) => {
        const result = await api.get('/search-data', {
            type,
            code,
        });
        debugger;
        dispatch({
            type: types.FETCH_DATA_DONE,
            payload: {
                currentData: result,
            },
        });
    };
}

export function setData(currentData) {
    return {
        type: types.SET_DATA,
        payload: {
            currentData,
        },
    };
}
