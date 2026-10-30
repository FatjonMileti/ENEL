import _ from 'lodash';

import { types } from './actions';
import { getImportKey } from 'services/lead';

import filters from 'services/filters';

const initialState = {
    allSelected: false,
    selectedKeys: [],
    totalUpdated: null,
    list: {
        itemsById: {},
        limit: 5,
        skip: 0,
        total: 0,
        editTotal: 0,
    },
    import: {
        itemsByKey: {},
        limit: 5,
        skip: 0,
        total: 0,
    },
    importErrors: {
        itemsByKey: {},
    },
};

function clearCache(state) {
    return {
        allSelected: false,
        selectedKeys: [],
        list: {
            itemsById: {},
            limit: 5,
            skip: 0,
            total: 0,
            editTotal: 0,
        },
        import: {
            itemsByKey: {},
            limit: 5,
            skip: 0,
            total: 0,
        },
        importErrors: {
            itemsByKey: {},
        },
    };
}

function clearList(state) {
    return {
        ...state,
        list: {
            itemsById: {},
            limit: 100,
            total: 0,
            skip: 0,
            editTotal: 0,
        },
    };
}

function clearSelection(state) {
    return {
        ...state,
        allSelected: false,
        selectedKeys: [],
    };
}

function fetchItemsDone(state, payload) {
    return {
        ...state,
        list: {
            ...state.list,
            itemsById: _.merge(state.list.itemsById, _.keyBy(payload.items, item => `_${item.id}`)),
            skip: payload.skip + state.list.limit,
            total: payload.total,
        },
    };
}

function fetchItemDone(state, payload) {
    return {
        ...state,
        list: {
            ...state.list,
            itemsById: {
                ...state.list.itemsById,
                [`_${payload.item.id}`]: payload.item,
            },
        },
    };
}

function cancelImport(state, payload) {
    return {
        ...state,
        allSelected: false,
        selectedKeys: [],
        import: {
            itemsByKey: {},
            limit: 5,
            skip: 0,
            total: 0,
        },
        importErrors: {
            itemsByKey: {},
        },
    };
}

function setImportItems(state, payload) {
    const itemsByKey = _.keyBy(payload.items, item => `_${item[getImportKey(item)]}`);
    return {
        ...state,
        import: {
            ...state.import,
            itemsByKey,
            total: _.size(itemsByKey),
        },
    };
}

function setImportSkip(state, payload) {
    return {
        ...state,
        import: {
            ...state.import,
            skip: payload.skip,
        },
    };
}

function setEditTotal(state, payload) {
    return {
        ...state,
        list: {
            ...state.list,
            editTotal: payload.editTotal,
        },
    };
}

function setTotalUpdated(state, payload) {
    return {
        ...state,
        totalUpdated: payload.totalUpdated,
    };
}

function toggleAllSelected(state) {
    return {
        ...state,
        allSelected: !state.allSelected,
        selectedKeys: [],
    };
}

function toggleItemSelected(state, payload) {
    const key = payload.item.id || payload.item[getImportKey(payload.item)];
    const isSelected = state.selectedKeys.includes(key);

    if (isSelected) {
        return {
            ...state,
            selectedKeys: state.selectedKeys.filter(item => item !== key),
        };
    }

    if (state.allSelected) {
        return {
            ...state,
            allSelected: false,
            selectedKeys: _.filter(
                state.import.itemsByKey,
                item => item[getImportKey[item]] !== key
            ).map(item => item[getImportKey[item]]),
        };
    }

    return {
        ...state,
        selectedKeys: _.uniq([...state.selectedKeys, key]),
    };
}

function bulkEditImport(state, payload) {
    let items = {};
    if (state.allSelected) {
        items = filters.filterImport(
            state.import.itemsByKey,
            payload.filters,
            payload.searchFilter
        );
    } else {
        state.selectedKeys.forEach(key => {
            items[`_${key}`] = state.import.itemsByKey[`_${key}`];
        });
    }

    _.each(items, (item, key) => (items[key] = { ...item, ...payload.data }));

    return {
        ...state,
        import: {
            ...state.import,
            itemsByKey: {
                ...state.import.itemsByKey,
                ...items,
            },
        },
    };
}

function setImportError(state, payload) {
    const { data, error } = payload;
    const key = data[getImportKey(data)];

    return {
        ...state,
        importErrors: {
            ...state.importErrors,
            itemsByKey: {
                ...state.importErrors.itemsByKey,
                [`_${key}`]: error.message,
            },
        },
    };
}

function unsetImportError(state, payload) {
    return {
        ...state,
        importErrors: {
            ...state.importErrors,
            itemsByKey: {},
        },
    };
}

function refreshImportTotal(state) {
    return {
        ...state,
        import: {
            ...state.import,
            total: _.size(state.import.itemsByKey),
        },
    };
}

function removeImportedItem(state, payload) {
    const { item } = payload;
    const key = item[getImportKey(item)];
    const items = { ...state.import.itemsByKey };
    delete items[`_${key}`];

    return {
        ...state,
        import: {
            ...state.import,
            itemsByKey: items,
        },
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.CLEAR_LIST:
            return clearList(state);

        case types.CLEAR_SELECTION:
            return clearSelection(state);

        case types.FETCH_ITEMS_DONE:
            return fetchItemsDone(state, action.payload);

        case types.FETCH_ITEM_DONE:
            return fetchItemDone(state, action.payload);

        case types.CANCEL_IMPORT:
            return cancelImport(state, action.payload);

        case types.SET_IMPORT_ITEMS:
            return setImportItems(state, action.payload);

        case types.SET_IMPORT_SKIP:
            return setImportSkip(state, action.payload);

        case types.SET_EDIT_TOTAL:
            return setEditTotal(state, action.payload);

        case types.SET_TOTAL_UPDATED:
            return setTotalUpdated(state, action.payload);

        case types.TOGGLE_ALL_SELECTED:
            return toggleAllSelected(state);

        case types.TOGGLE_ITEM_SELECTED:
            return toggleItemSelected(state, action.payload);

        case types.BULK_EDIT_IMPORT:
            return bulkEditImport(state, action.payload);

        case types.SET_IMPORT_ERROR:
            return setImportError(state, action.payload);

        case types.UNSET_IMPORT_ERRORS:
            return unsetImportError(state);

        case types.REMOVE_IMPORTED_ITEM:
            return removeImportedItem(state, action.payload);

        case types.REFRESH_IMPORT_TOTAL:
            return refreshImportTotal(state);

        default:
            return state;
    }
}
