import _ from 'lodash';

export function getItems(state, codeType, market) {
    return _.filter(state.invoiceExamples.itemsById, (item) => {
        if (market && item.market != market) return false;
        if (!market && item.market) return false;
        if (codeType && item.code_type != codeType) return false;
        return true;
    });
}

export function getItemById(state, id) {
    return state.invoiceExamples.itemsById[`_${id}`];
}
