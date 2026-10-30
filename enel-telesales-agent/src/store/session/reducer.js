import { types } from './actions';
import _ from 'lodash';

const initialState = {
    allSelected: false,
    selectedKeys: [],
    step: 1,
    data: {},
    list: {
        itemsById: {},
        limit: 100,
        total: 0,
        skip: 0,
    },
};

function clearCache(state) {
    return initialState;
}

function clearList(state) {
    return {
        ...state,
        list: {
            itemsById: {},
            limit: 100,
            total: 0,
            skip: 0,
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

function clearData(state) {
    return {
        ...state,
        step: 1,
        completed: {
            ee: false,
            gaz: false,
        },
        data: {},
    };
}

function patchSession(state, payload) {
    let o = {
        ...state,
        data: _.merge(state.data, payload.session),
    };
    //NOTE: _.merge doesn't update the array
    if (payload.session && payload.session.ee_contact)
        o.data.ee_contact.discounts = payload.session.ee_contact.discounts;
    if (payload.session && payload.session.gaz_contact)
        o.data.gaz_contact.discounts = payload.session.gaz_contact.discounts;
    return o;
}

function restoreSession(state, payload) {
    return {
        ...state,
        data: payload.data,
    };
}

function setStep(state, step) {
    return { ...state, step };
}

function setContractType(state, contract_type) {
    return { ...state, data: { ...state.data, contract_type } };
}

function setProvider(state, payload) {
    return {
        ...state,
        data: _.merge(state.data, {
            [`${payload.flow}_are_furnizare_activa`]: true,
            [`${payload.flow}_furnizor_actual`]: payload.providerId,
            [`${payload.flow}_loc`]: {
                furnizor_id: payload.providerId,
            },
        }),
    };
}

function unsetProvider(state, payload) {
    return {
        ...state,
        data: _.merge(state.data, {
            [`${payload.flow}_are_furnizare_activa`]: false,
            [`${payload.flow}_furnizor_actual`]: '',
            [`${payload.flow}_loc`]: {
                furnizor_id: '',
            },
        }),
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

function toggleAllSelected(state) {
    return {
        ...state,
        allSelected: !state.allSelected,
        selectedKeys: [],
    };
}

function toggleItemSelected(state, payload) {
    const key = payload.item.id;
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
            selectedKeys: [],
        };
    }

    return {
        ...state,
        selectedKeys: _.uniq([...state.selectedKeys, key]),
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

        case types.CLEAR_DATA:
            return clearData(state);

        case types.SET_STEP:
            return setStep(state, action.payload);

        case types.SET_CONTRACT_TYPE:
            return setContractType(state, action.payload);

        case types.SET_PROVIDER:
            return setProvider(state, action.payload);

        case types.UNSET_PROVIDER:
            return unsetProvider(state, action.payload);

        case types.PATCH:
            return patchSession(state, action.payload);

        case types.FETCH_ITEMS_DONE:
            return fetchItemsDone(state, action.payload);

        case types.FETCH_ITEM_DONE:
            return fetchItemDone(state, action.payload);

        case types.TOGGLE_ALL_SELECTED:
            return toggleAllSelected(state);

        case types.TOGGLE_ITEM_SELECTED:
            return toggleItemSelected(state, action.payload);

        case types.RESTORE_SESSION:
            return restoreSession(state, action.payload);

        default:
            return state;
    }
}
