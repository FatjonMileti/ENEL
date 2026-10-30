import Immutable from 'seamless-immutable';
import { types } from './actions';
import _ from 'lodash';

const initialState = Immutable({
    loading: false,
    redirectTo: null,
    totalSteps: 12,
    eeHideClientPlaceDocs: false,
    gazHideClientPlaceDocs: false,
});

function clearCache(state) {
    return state.merge(initialState);
}

function showLoading(state) {
    return state.merge({
        loading: true,
    });
}

function hideLoading(state) {
    return state.merge({
        loading: false,
    });
}

function setRedirect(state, action) {
    return state.merge({
        redirectTo: action.payload.value,
    });
}

function showClientPlaceDocs(state, action) {
    return state.merge({
        [`${action.payload.flow}HideClientPlaceDocs`]: false,
    });
}

function hideClientPlaceDocs(state, action) {
    return state.merge({
        [`${action.payload.flow}HideClientPlaceDocs`]: true,
    });
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
    case types.CLEAR_CACHE:
    case 'RESET_SESSION':
        return clearCache(state);

    case types.SHOW_LOADING:
        return showLoading(state);

    case types.HIDE_LOADING:
        return hideLoading(state);

    case types.SET_REDIRECT:
        return setRedirect(state, action);
        
    case types.SHOW_CLIENT_PLACE_DOCS:
        return showClientPlaceDocs(state, action);

    case types.HIDE_CLIENT_PLACE_DOCS:
        return hideClientPlaceDocs(state, action);

    default:
        return state;
    }
}
