import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.companies.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.companies.itemsById[`_${id}`];
}
