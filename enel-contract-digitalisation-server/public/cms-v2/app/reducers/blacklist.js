let initialState = {
    total: 0,
    data: [],
    sortColumn: 'createdAt',
    ascending: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'BLACKLIST/SORT':
            return {
                ...state,
                ascending: !state.ascending
            }
        case 'BLACKLIST/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                currentIndex: action.payload.data.length,
            }
        case 'BLACKLIST/APPEND':
            return {
                ...state,
                total: action.payload.total || 0,
                data: state.data.concat(action.payload.data),
                currentIndex: state.currentIndex + action.payload.data.length,
            }
        default:
            return state;
    }
};

export default reducer;