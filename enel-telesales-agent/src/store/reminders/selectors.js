import _ from 'lodash';

export function getItems(state) {
    return _.sortBy(state.reminders.itemsById, item => -1 * item.id);
}
