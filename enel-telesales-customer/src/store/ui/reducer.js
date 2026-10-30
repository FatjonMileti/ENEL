import { types } from './actions';

const initialState = {
    loading: false,
    redirectTo: null,
    totalSteps: 12,
    eeHideClientPlaceDocs: false,
    gazHideClientPlaceDocs: false,
    docLoading: {
        ee: {},
        gaz: {},
    },
};

function showLoading(state) {
    return {
        ...state,
        loading: true,
    };
}

function hideLoading(state) {
    return {
        ...state,
        loading: false,
    };
}

function setDocLoading(state, payload) {
    const { flow, docType } = payload;
    return {
        docLoading: {
            ...state.docLoading,
            [flow]: {
                ...state.docLoading[flow],
                [docType]: true,
            },
        },
    };
}

function unsetDocLoading(state, payload) {
    const { flow, docType } = payload;
    return {
        docLoading: {
            ...state.docLoading,
            [flow]: {
                ...state.docLoading[flow],
                [docType]: false,
            },
        },
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.SHOW_LOADING:
            return showLoading(state);

        case types.HIDE_LOADING:
            return hideLoading(state);

        case types.SET_DOC_LOADING:
            return setDocLoading(state, action.payload);

        case types.UNSET_DOC_LOADING:
            return unsetDocLoading(state, action.payload);

        default:
            return state;
    }
}
