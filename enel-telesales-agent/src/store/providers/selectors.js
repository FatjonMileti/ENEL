import _ from 'lodash';

export function getItems(state, type) {
    let items = state.providers.itemsById;

    if (type === 'ee') {
        items = _.filter(items, item => item.ee);
    } else if (type === 'gaz') {
        items = _.filter(items, item => item.gaz);
    }

    return _.sortBy(items, item => item.denumire);
}
