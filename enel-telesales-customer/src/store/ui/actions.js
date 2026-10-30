import disableScroll from 'disable-scroll';

export const types = {
    SHOW_LOADING: 'ui.SHOW_LOADING',
    HIDE_LOADING: 'ui.HIDE_LOADING',
    SET_DOC_LOADING: 'ui.SET_DOC_LOADING',
    UNSET_DOC_LOADING: 'ui.UNSET_DOC_LOADING',
};

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

export function setDocLoading(flow, docType) {
    return {
        type: types.SET_DOC_LOADING,
        payload: { flow, docType },
    };
}

export function unsetDocLoading(flow, docType) {
    return {
        type: types.UNSET_DOC_LOADING,
        payload: { flow, docType },
    };
}
