export function getID(state) {
    return state.documents.id;
}

export function getRegistrationFisc(state) {
    return state.documents.registrationFisc;
}

export function getPowerOfAttorney(state) {
    return state.documents.powerOfAttorney;
}

export function getPowerOfAttorneyOrReg(state) {
    return state.documents.powerOfAttorneyOrReg;
}

export function getDocConstituive(state) {
    return state.documents.docConstituive;
}

export function getDocs(state) {
    return state.documents.docs;
}

export function getTimestamps(state) {
    return state.documents.timestamps;
}

export function getAgentSignature(state) {
    return state.documents.agentSignature;
}

export const isDocUploaded = state => (docType, flow) => {
    if (docType === 'CI') {
        return !!getID(state);
    } else if (docType === 'REGISTRATION_FISC_CERT') {
        return !!getRegistrationFisc(state);
    } else if (docType === 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE') {
        return !!getPowerOfAttorneyOrReg(state);
    } else if (docType === 'SEMNATURA_AGENT') {
        return !!getAgentSignature(state);
    } else {
        const docs = getDocs(state);
        return !!docs[flow][docType];
    }
};
