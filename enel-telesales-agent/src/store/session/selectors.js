import _ from 'lodash';

export function getSession(state) {
    return state.session.data;
}

export function getStep(state) {
    return state.session.step;
}

export function isBackoffice(state, flow) {
    return getSession(state).backoffice;
}

export function hasDocsCompleted(state) {
    return state.session.data ? !!state.session.data.client_upload_agree_date : false;
}

export function getItems(state) {
    return _.sortBy(state.session.list.itemsById, item => -1 * item.id);
}

export function getItemById(state, id) {
    return state.session.list.itemsById[`_${id}`];
}

export function getSkip(state) {
    return state.session.list.skip;
}

export function getLimit(state) {
    return state.session.list.limit;
}

export function getTotal(state) {
    return state.session.list.total;
}

export function getFlow(state) {
    const session = getSession(state);
    if (!_.isEmpty(session.ee_serviciu) || !_.isEmpty(session.gaz_serviciu)) {
        return _.isEmpty(session.gaz_serviciu) ? 'EE' : 'GAZ';
    }
    return '';
}

export function getContractType(state) {
    const session = getSession(state);
    return session.contract_type;
    // return "b2b";
}

export function isContractSent(state) {
    const session = getSession(state);
    if (!session.type) {
        return false;
    }

    if (_.isBoolean(session.ee_agree) || _.isBoolean(session.gaz_agree)) {
        return true;
    }

    if (session.type === 'COMBO') {
        return !!(session.ee_sign_date && session.gaz_sign_date);
    }

    return !!session[`${session.type.toLowerCase()}_sign_date`];
}

export const isFlowSigned = state => flow => {
    const session = getSession(state);
    return !!session[`${flow.toLowerCase()}_sign_date`];
};

export function isAllSelected(state) {
    return state.session.allSelected;
}

export function selectedKeys(state) {
    return state.session.selectedKeys;
}

export function hasSelection(state) {
    return state.session.allSelected || state.session.selectedKeys.length > 0;
}

export const isItemSelected = state => session => {
    return state.session.selectedKeys.includes(session.id);
};

export function totalSelected(state) {
    return state.session.allSelected ? state.session.list.total : state.session.selectedKeys.length;
}
