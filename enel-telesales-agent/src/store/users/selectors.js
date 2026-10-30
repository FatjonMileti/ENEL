import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.users.itemsById, item => item.denumire);
}

export function getItemById(state, id) {
    return state.users.itemsById[`_${id}`];
}
