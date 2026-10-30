import _ from 'lodash';

export function expandSidebar(state) {
    return state.ui.expandSidebar;
}

export function hasSidebar(state) {
    return state.ui.hasSidebar;
}

export function hasSearch(state) {
    return state.ui.hasSearch;
}

export function hasFilters(state) {
    return state.ui.hasFilters;
}

export function hasDateFilters(state) {
    return state.ui.hasDateFilters;
}

export function getSearchFilter(state) {
    return state.ui.search;
}

export function getFilters(state) {
    return state.ui.filters;
}

export function getDateFilters(state) {
    return state.ui.dateFilters;
}

export const isDocLoading = state => (flow, docType) => {
    const { docLoading } = state.ui;
    if (flow && docType) {
        return docLoading[flow][docType];
    }

    return !!_.find(docLoading.ee, item => item) || !!_.find(docLoading.gaz, item => item);
};
