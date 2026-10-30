import _ from 'lodash';

import { getImportKey } from 'services/lead';
import { getFilters, getSearchFilter } from 'store/ui/selectors';

import filters from 'services/filters';

export function getItems(state) {
    return _.sortBy(state.leads.list.itemsById, item => -1 * item.id);
}

export const getItemById = state => id => {
    return state.leads.list.itemsById[`_${id}`];
};

export function getSkip(state) {
    return state.leads.list.skip;
}

export function getLimit(state) {
    return state.leads.list.limit;
}

export function getTotal(state) {
    return state.leads.list.total;
}

export function getEditTotal(state) {
    return state.leads.list.editTotal;
}

export function getFilteredImportItems(state) {
    const items = filters.filterImport(
        state.leads.import.itemsByKey,
        getFilters(state),
        getSearchFilter(state)
    );
    return _.sortBy(items, item => item.index);
}

export function getSelectedItems(state) {
    const keys = selectedKeys(state);
    const items = _.filter(state.leads.list.itemsById, item => keys.includes(item.id));
    return _.sortBy(items, item => item.index);
}

export function getAllImportItems(state) {
    return _.sortBy(state.leads.import.itemsByKey, item => -1 * item.id);
}

export function getSelectedImportItems(state) {
    const keys = selectedKeys(state);
    const items = _.filter(state.leads.import.itemsByKey, item =>
        keys.includes(item[getImportKey(item)])
    );
    return _.sortBy(items, item => item.index);
}

export function getUploadImportItems(state) {
    const keys = selectedKeys(state);
    const allSelected = isAllSelected(state);

    if (keys && keys.length) {
        return getSelectedImportItems(state);
    } else if (allSelected) {
        return getFilteredImportItems(state);
    }

    return [];
}

export function listImportItems(state) {
    const { skip, limit } = state.leads.import;
    return getFilteredImportItems(state).slice(0, skip + limit);
}

export function getImportSkip(state) {
    return state.leads.import.skip;
}

export function getImportLimit(state) {
    return state.leads.import.limit;
}

export function getImportTotal(state) {
    return state.leads.import.total;
}

export function getImportSelected(state) {
    return state.leads.allSelected ? state.leads.import.total : state.leads.selectedKeys.length;
}

export const getImportLeadError = state => lead => {
    const key = lead[getImportKey(lead)];
    return state.leads.importErrors.itemsByKey[`_${key}`];
};

export const hasImportLeadError = state => lead => {
    return !!getImportLeadError(state)(lead);
};

export function isAllSelected(state) {
    return state.leads.allSelected;
}

export function selectedKeys(state) {
    return state.leads.selectedKeys;
}

export function totalUpdated(state) {
    return state.leads.totalUpdated;
}

export function hasSelection(state) {
    return state.leads.allSelected || state.leads.selectedKeys.length > 0;
}

export const isItemSelected = state => lead => {
    return state.leads.selectedKeys.includes(lead.id || lead[getImportKey(lead)]);
};

export function totalSelected(state) {
    return state.leads.allSelected ? state.leads.list.editTotal : state.leads.selectedKeys.length;
}
