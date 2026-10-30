import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.cities.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.cities.itemsById[`_${id}`];
}
