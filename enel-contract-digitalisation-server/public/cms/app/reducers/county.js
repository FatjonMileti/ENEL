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
        case 'COUNTY/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'COUNTY/LOADING':
            return {
                ...state,
                isLoading: true
            }
        default:
            return state;
    }
};

export default reducer;

