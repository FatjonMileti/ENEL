import _ from 'lodash';

export function getItems(state) {
    return state.campaigns.itemsById;
}

export function getItemById(state, id) {
    return state.campaigns.itemsById[`_${id}`];
}
