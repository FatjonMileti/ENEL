import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.leadImportTemplates.itemsById, item => -1 * item.id);
}

export function getCurrentItem(state) {
    return state.leadImportTemplates.currentItem;
}
