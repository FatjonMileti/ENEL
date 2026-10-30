export default (KEY) => {
    let initialState = {
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
    };

    return (state = initialState, action) => {
        switch (action.type) {
            case `${KEY}/SORT_SESSIONS`:
                return {
                    ...state,
                    sortColumn: action.payload.column,
                    ascending: action.payload.column === state.sortColumn ? !state.ascending : action.payload.ascending
                };
            case `${KEY}/INIT_SESSIONS`:
                return {
                    ...state,
                    list: action.payload.data,
                    total: action.payload.total,
                    sortColumn: action.payload.sortColumn,
                    ascending: action.payload.ascending,
                    currentIndex: action.payload.data.length,

                    count: {
                        ...state.count,
                        closed: action.payload.closed !== undefined ? action.payload.closed : state.count.closed,
                        activatedTrue: action.payload.activatedTrue !== undefined ? action.payload.activatedTrue : state.count.activatedTrue,
                        today: action.payload.today !== undefined ? action.payload.today : state.count.today,
                        week: action.payload.week !== undefined ? action.payload.week : state.count.week,
                        month: action.payload.month !== undefined ? action.payload.month : state.count.month
                    },

                    isLoading: false
                }
            case `${KEY}/INIT_COUNTERS`:
                return {
                    ...state,
                    count: {
                        ...state.count,
                        closed: action.payload.closed !== undefined ? action.payload.closed : state.count.closed,
                        activatedTrue: action.payload.activatedTrue !== undefined ? action.payload.activatedTrue : state.count.activatedTrue,
                        today: action.payload.today,
                        week: action.payload.week,
                        month: action.payload.month
                    }
                }
            case `${KEY}/APPEND_SESSIONS`:
                return {
                    ...state,
                    total: action.payload.total,
                    list: state.list.concat(action.payload.data),
                    currentIndex: state.currentIndex + action.payload.data.length,
                    isLoading: false
                }
            case `${KEY}/SESSION_LOADING`:
                return {
                    ...state,
                    isLoading: true
                }
            default:
                return state;
        }
    };
}