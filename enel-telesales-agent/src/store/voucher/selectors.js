export function getItemById(state, id) {
    return state.vouchers[id];
}

export function getItem(state) {
    return state.voucher.voucher;
}
