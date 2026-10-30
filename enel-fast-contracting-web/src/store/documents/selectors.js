import _ from 'lodash';
import { getFlow } from 'store/client/selectors';

export function getGeneratedDocs(state) {
    return state.documents.generatedDocs;
}

export function getOwnerDocs(state) {
    const flow = getFlow(state).toLowerCase();
    return state.documents[`${flow}OwnerDocs`];
}

export function getID(state) {
    return state.documents.id;
}

export function getInvoice(state) {
    const flow = getFlow(state).toLowerCase();
    return state.documents[`${flow}Invoice`];
}

export function getInvoicePDF(state) {
    const flow = getFlow(state).toLowerCase();
    return state.documents[`${flow}InvoicePDF`];
}

export function getBusinessIdDocs(state) {
    const flow = getFlow(state).toLowerCase();
    return state.documents[`${flow}BusinessIdDocs`];
}
