let initialState = {
    total: 0,
    data: [],
    sortColumn: 'createdAt',
    ascending: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'REPORT/SORT':
            return {
                ...state,
                ascending: !state.ascending
            }
        case 'REPORT/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                isLoading: false,
                currentIndex: action.payload.data.length,
            }
        case 'REPORT/REPORT_LOADING':
            return {
                ...state,
                isLoading: true
            }
        case 'REPORT/APPEND':
            return {
                ...state,
                total: action.payload.total || 0,
                data: state.data.concat(action.payload.data),
                currentIndex: state.currentIndex + action.payload.data.length,
                isLoading: false
            }
        default:
            return state;
    }
};

export default reducer;