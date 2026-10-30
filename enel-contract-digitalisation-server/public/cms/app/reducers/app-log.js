let initialState = {
    total: 0,
    limit: 0,
    skip: false,
    data: [],
    sortColumn: 'createdAt',
    ascending: false,
    isLoading: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'APP_LOG/SORT':
            return {
                ...state,
                ascending: !state.ascending
            }
        case 'APP_LOG/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'APP_LOG/APPEND':
            return {
                ...state,
                total: action.payload.total || 0,
                data: state.data.concat(action.payload.data),
                currentIndex: state.currentIndex + action.payload.data.length,
                isLoading: false
            }
        case 'APP_LOG/LOADING':
            return {
                ...state,
                isLoading: true
            }
        default:
            return state;
    }
};

export default reducer;

