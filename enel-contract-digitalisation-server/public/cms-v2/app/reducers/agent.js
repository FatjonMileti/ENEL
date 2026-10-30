import _ from 'lodash';

let initialState = {
    info: null,
    sessions: {
        total: 0,
        sortColumn: '',
        ascending: false,
        list: [],

        currentIndex: 0,
        isLoading: false,

        count: {
            started: 0,
            activated: 0,
            pending: 0,
            rejected: 0,
            errored: 0,
            unfinished: 0,
            totalPending: 0,
            byPeriod: {},
        }
    },
    formSelects: {}
};

const reducer = (state = initialState, action) => {
    switch (action.type) {

        case 'INIT_AGENT':
            return {
                ...state,
                info: {
                    ...state.info,
                    ...action.payload.info
                },
                sessions: {
                    ...state.sessions,
                    list: action.payload.data,
                    total: action.payload.total,
                    sortColumn: action.payload.sortColumn,
                    ascending: action.payload.ascending,
                    currentIndex: action.payload.data ? action.payload.data.length : 0,
                    isLoading: false,
                },
                formSelects: { 
                    ...state.formSelects,
                    ...action.payload.formSelects
                }
            }
        case `AGENT/COUNT/STATUS`:
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    count: {
                        ...state.sessions.count,
                        ...action.payload,
                    }
                }
            };
        case `AGENT/SORT_SESSIONS`:
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    sortColumn: action.payload.column,
                    ascending: action.payload.column === state.sessions.sortColumn ? !state.sessions.ascending : action.payload.ascending
                }
            };
        case 'AGENT/SESSION_LOADING':
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    isLoading: true
                }
            }
        case 'AGENT/APPEND_SESSIONS':
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    total: action.payload.total,
                    list: state.sessions.list.concat(action.payload.data),
                    currentIndex: state.sessions.currentIndex + action.payload.data.length,
                    isLoading: false
                }
            }
        case 'AGENT/COUNT/TOTAL_PENDING':
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    count: {
                        ...state.sessions.count,
                        totalPending: action.payload,
                    }
                }
            }
        case 'AGENT/COUNT/PERIOD':
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    count: {
                        ...state.sessions.count,
                        byPeriod: action.payload,
                    }
                }
            };

        case '@@router/LOCATION_CHANGE':
            return initialState;

        default:
            return state;
    }
};

export default reducer;