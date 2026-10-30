import { types } from './actions';

const initialState = {
    hasSidebar: false,
    hasSearch: false,
    hasFilters: false,
    hasDateFilters: false,
    expandSidebar: false,
    search: null,
    filters: {},
    dateFilters: {
        start: null,
        end: null,
    },
    docLoading: {
        ee: {},
        gaz: {},
    },
};

function toggleSidebar(state) {
    return {
        ...state,
        expandSidebar: !state.expandSidebar,
    };
}

function hasSidebar(state, payload) {
    return {
        ...state,
        hasSidebar: payload.hasSidebar,
    };
}

function hasSearch(state, payload) {
    return {
        ...state,
        hasSearch: payload.hasSearch,
    };
}

function hasFilters(state, payload) {
    return {
        ...state,
        hasFilters: payload.hasFilters,
    };
}

function hasDateFilters(state, payload) {
    return {
        ...state,
        hasDateFilters: payload.hasDateFilters,
    };
}

function setSearch(state, payload) {
    return {
        ...state,
        search: payload.value,
    };
}

function setFilters(state, payload) {
    return {
        ...state,
        filters: payload.filters,
    };
}

function setDateFilters(state, payload) {
    return {
        ...state,
        dateFilters: payload.dateFilters,
    };
}

function setDocLoading(state, payload) {
    const { flow, docType } = payload;
    return {
        ...state,
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
        ...state,
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
        case types.TOGGLE_SIDEBAR:
            return toggleSidebar(state);

        case types.HAS_SIDEBAR:
            return hasSidebar(state, action.payload);

        case types.HAS_SEARCH:
            return hasSearch(state, action.payload);

        case types.HAS_FILTERS:
            return hasFilters(state, action.payload);

        case types.HAS_DATE_FILTERS:
            return hasDateFilters(state, action.payload);

        case types.SET_SEARCH:
            return setSearch(state, action.payload);

        case types.SET_FILTERS:
            return setFilters(state, action.payload);

        case types.SET_DATE_FILTERS:
            return setDateFilters(state, action.payload);

        case types.SET_DOC_LOADING:
            return setDocLoading(state, action.payload);

        case types.UNSET_DOC_LOADING:
            return unsetDocLoading(state, action.payload);

        default:
            return state;
    }
}
