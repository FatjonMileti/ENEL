import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.streets.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.streets.itemsById[`_${id}`];
}
