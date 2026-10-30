import api from '../../services/api';
import disableScroll from 'disable-scroll';
import { getFlow } from 'store/client/selectors';

export const types = {
    CLEAR_CACHE: 'session.CLEAR_CACHE',
    SHOW_LOADING: 'ui.SHOW_LOADING',
    HIDE_LOADING: 'ui.HIDE_LOADING',
    SET_REDIRECT: 'ui.SET_REDIRECT',
    HIDE_CLIENT_PLACE_DOCS: 'ui.HIDE_CLIENT_PLACE_DOCS',
    SHOW_CLIENT_PLACE_DOCS: 'ui.SHOW_CLIENT_PLACE_DOCS',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function showLoading() {
    return async (dispatch, getState) => {
        disableScroll.on();
        dispatch({
            type: types.SHOW_LOADING,
        });
    };
}

export function hideLoading() {
    return async (dispatch, getState) => {
        disableScroll.off();
        dispatch({
            type: types.HIDE_LOADING,
        });
    };
}

export function setRedirect(value) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.SET_REDIRECT,
            payload: { value },
        });
    };
}

export function showClientPlaceDocs() {
    return async (dispatch, getState) => {
        const flow = getFlow(getState()).toLowerCase();
        dispatch({
            type: types.SHOW_CLIENT_PLACE_DOCS,
            payload: { flow },
        });
    };
}

export function hideClientPlaceDocs() {
    return async (dispatch, getState) => {
        const flow = getFlow(getState()).toLowerCase();
        dispatch({
            type: types.HIDE_CLIENT_PLACE_DOCS,
            payload: { flow },
        });
    };
}

export function unsetRedirect() {
    return async (dispatch, getState) => {
        dispatch({
            type: types.SET_REDIRECT,
            payload: { value: null },
        });
    };
}
