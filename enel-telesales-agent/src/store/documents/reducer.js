import { types } from './actions';

const initialState = {
    id: null,
    docs: {
        ee: {},
        gaz: {},
    },
    timestamps: {
        ee: {},
        gaz: {},
    },
};

function clearCache(state) {
    return {
        id: null,
        agentSignature: null,
        docs: {
            ee: {},
            gaz: {},
        },
        timestamps: {
            ee: {},
            gaz: {},
        },
    };
}

function setID(state, payload) {
    return { ...state, id: payload.image };
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

function setTimestamps(state, payload) {
    return {
        ...state,
        timestamps: payload.timestamps,
    };
}

function setAgentSignature(state, payload) {
    return { ...state, agentSignature: payload.image };
}

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.CLEAR_CACHE:
        case 'RESET_SESSION':
            return clearCache(state);

        case types.SET_ID:
            return setID(state, action.payload);

        case types.SET_DOC:
            return setDoc(state, action.payload);

        case types.SET_TIMESTAMPS:
            return setTimestamps(state, action.payload);

        case types.SET_AGENT_SIGNATURE:
            return setAgentSignature(state, action.payload);

        default:
            return state;
    }
}
