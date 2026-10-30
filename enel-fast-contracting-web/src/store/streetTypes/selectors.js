import _ from 'lodash';

export function getItems(state) {
    return state.streetTypes.itemsById;
}

export function getItemById(state, id) {
    return state.streetTypes.itemsById[`_${id}`];
}
