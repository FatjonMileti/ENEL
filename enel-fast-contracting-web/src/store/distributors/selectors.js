import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.distributors.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.distributors.itemsById[`_${id}`];
}
