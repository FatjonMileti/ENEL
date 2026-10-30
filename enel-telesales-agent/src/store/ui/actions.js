export const types = {
    TOGGLE_SIDEBAR: 'ui.TOGGLE_SIDEBAR',
    HAS_SIDEBAR: 'ui.HAS_SIDEBAR',
    HAS_SEARCH: 'ui.HAS_SEARCH',
    HAS_FILTERS: 'ui.HAS_FILTERS',
    HAS_DATE_FILTERS: 'ui.HAS_DATE_FILTERS',
    SET_SEARCH: 'ui.SET_SEARCH',
    SET_FILTERS: 'ui.SET_FILTERS',
    SET_DATE_FILTERS: 'ui.SET_DATE_FILTERS',
    SET_DOC_LOADING: 'ui.SET_DOC_LOADING',
    UNSET_DOC_LOADING: 'ui.UNSET_DOC_LOADING',
};

export function toggleSidebar() {
    return {
        type: types.TOGGLE_SIDEBAR,
    };
}

export function hasSidebar(value) {
    return {
        type: types.HAS_SIDEBAR,
        payload: { hasSidebar: value },
    };
}

export function hasSearch(value) {
    return {
        type: types.HAS_SEARCH,
        payload: { hasSearch: value },
    };
}

export function hasFilters(value) {
    return {
        type: types.HAS_FILTERS,
        payload: { hasFilters: value },
    };
}

export function hasDateFilters(value) {
    return {
        type: types.HAS_DATE_FILTERS,
        payload: { hasDateFilters: value },
    };
}

export function setSearch(value) {
    return {
        type: types.SET_SEARCH,
        payload: { value },
    };
}

export function setFilters(value) {
    return {
        type: types.SET_FILTERS,
        payload: { filters: value },
    };
}

export function setDateFilters(value) {
    return {
        type: types.SET_DATE_FILTERS,
        payload: { dateFilters: value },
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
