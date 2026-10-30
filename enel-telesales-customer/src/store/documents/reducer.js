import { types } from './actions';

const initialState = {
    generatedDocs: {
        ee: [],
        gaz: [],
    },
    eeOwnerDocs: {},
    gazOwnerDocs: {},
    id: null,
    signature: null,
    docs: {},
};

function clearCache(state) {
    return initialState;
}

function setGeneratedDocs(state, payload) {
    return {
        ...state,
        generatedDocs: {
            ...state.generatedDocs,
            [payload.flow]: payload.docs,
        },
    };
}

function setOwnerDocs(state, payload) {
    return {
        ...state,
        [`${payload.type.toLowerCase()}OwnerDocs`]: payload.docs,
    };
}

function setID(state, payload) {
    return { ...state, id: payload.image };
}

function setSignature(state, payload) {
    return { ...state, signature: payload.image };
}

function setDoc(state, payload) {
    return {
        ...state,
        docs: {
            ...state.docs,
            [payload.flow]: {
                ...state.docs[payload.flow],
                [payload.docType]: payload.images,
            },
        },
    };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.SET_GENERATED_DOCS:
            return setGeneratedDocs(state, action.payload);

        case types.SET_OWNER_DOCS:
            return setOwnerDocs(state, action.payload);

        case types.SET_ID:
            return setID(state, action.payload);

        case types.SET_SIGNATURE:
            return setSignature(state, action.payload);

        case types.SET_DOC:
            return setDoc(state, action.payload);

        default:
            return state;
    }
}
