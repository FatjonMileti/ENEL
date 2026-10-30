import api from '../../services/api';
import _ from 'lodash';

export const types = {
    FETCH_PLACE_DONE: 'place.FETCH_PLACE_DONE',
    SET_CURRENT_PLACE: 'place.SET_CURRENT_PLACE',
    CLEAR_CACHE: 'place.CLEAR_CACHE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function searchPlace(type, code) {
    return async (dispatch, getState) => {
        const result = await api.get('/place', {
            type,
            // county,
            // city,
            code,
        });

        dispatch({
            type: types.FETCH_PLACE_DONE,
            payload: {
                place: result,
            },
        });
    };
}

export function setCurrentPlace(place) {
    return {
        type: types.SET_CURRENT_PLACE,
        payload: {
            place,
        },
    };
}
