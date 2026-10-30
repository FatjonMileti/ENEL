import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.counties.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.counties.itemsById[`_${id}`];
}
