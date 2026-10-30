// import { getFlow } from 'store/client/selectors';

export function getGeneratedDocs(state) {
    return state.documents.generatedDocs;
}

// export function getOwnerDocs(state) {
//     const flow = getFlow(state).toLowerCase();
//     return state.documents[`${flow}OwnerDocs`];
// }

export function getID(state) {
    return state.documents.id;
}

export function getSignature(state) {
    return state.documents.signature;
}

export function getDocs(state) {
    return state.documents.docs;
}
