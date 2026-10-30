let initialState = {
    total: 0,
    sortColumn: '',
    ascending: false,
    list: [],
    map: [],
    mapSyncDate: (new Date()).toISOString(),

    currentIndex: 0,
    isLoading: false,

    count: {
        started: 0,
        activated: 0,
        pending: 0,
        rejected: 0,
        unfinished: 0,
        errored: 0,
        totalPending: 0,
        detailed: {},
        byPeriod: {},
        byChannel: {},
        byCompany: {},
        unknown: {},
    }
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SESSION/SORT_SESSIONS':
            return {
                ...state,
                sortColumn: action.payload.column,
                ascending: action.payload.column === state.sortColumn ? !state.ascending : action.payload.ascending
            };
        case 'SESSION/INIT_MAP_SESSIONS':
            return {
                ...state,
                map: action.payload.data,
                mapSyncDate: (new Date()).toISOString(),
            }
        case 'SESSION/INIT_SESSIONS':
            return {
                ...state,
                list: action.payload.data,
                total: action.payload.total,
                sortColumn: action.payload.sortColumn,
                ascending: action.payload.ascending,
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'SESSION/APPEND_SESSIONS':
            return {
                ...state,
                total: action.payload.total,
                list: state.list.concat(action.payload.data),
                currentIndex: state.currentIndex + action.payload.data.length,
                isLoading: false
            }
        case 'SESSION/SESSION_LOADING':
            return {
                ...state,
                isLoading: true
            }
        case 'SESSION/COUNT/STATUS':
            return {
                ...state,
                count: {
                    ...state.count,
                    ...action.payload
                },
            }
        case 'SESSION/COUNT/TOTAL_PENDING':
            return {
                ...state,
                count: {
                    ...state.count,
                    totalPending: action.payload,
                },
            }
        case 'SESSION/COUNT/PERIOD':
            return {
                ...state,
                count: {
                    ...state.count,
                    byPeriod: action.payload,
                },
            }
        case 'SESSION/COUNT/CHANNEL':
            return {
                ...state,
                count: {
                    ...state.count,
                    byChannel: action.payload,
                },
            }
        case 'SESSION/COUNT/COMPANY':
            return {
                ...state,
                count: {
                    ...state.count,
                    byCompany: action.payload,
                },
            }
        case 'SESSION/COUNT/UNKNOWN':
            return {
                ...state,
                count: {
                    ...state.count,
                    unknown: action.payload,
                },
            }
        case 'SESSION/COUNT/DETAILED':
            return {
                ...state,
                count: {
                    ...state.count,
                    detailed: action.payload,
                },
            }
        default:
            return state;
    }
};

export default reducer;