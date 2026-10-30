import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.banks.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.banks.itemsById[`_${id}`];
}
