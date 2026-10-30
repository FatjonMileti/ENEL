export function getItems(state) {
    return state.discounts.itemsById;
}

export function getItemById(state, id) {
    return state.discounts.itemsById[`_${id}`];
}
