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
            closed: 0,
            activatedTrue: 0,

            today: 0,
            week: 0,
            month: 0
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

                    count: {
                        ...state.sessions.count,
                        closed: action.payload.closed,
                        activatedTrue: action.payload.activatedTrue,

                        today: action.payload.today,
                        week: action.payload.week,
                        month: action.payload.month
                    },
                },
                formSelects: { 
                    ...state.formSelects,
                    ...action.payload.formSelects
                }
            }
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
        case '@@router/LOCATION_CHANGE':
            return initialState;
        default:
            return state;
    }
};

export default reducer;