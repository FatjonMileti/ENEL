let initialState = {
    total: 0,
    online: 0,
    offline: 0,
    limit: 0,
    skip: false,
    data: [],
    sortColumn: 'lastPingAt',
    ascending: false,
    isLoading: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOCATION/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                online: action.payload.data.filter(item => item.status === 'online').length,
                offline: action.payload.data.filter(item => item.status === 'offline').length,
                data: action.payload.data || [],
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'LOCATION/APPEND_LOCATIONS':
            return {
                ...state,
                total: action.payload.total || 0,
                data: state.data.concat(action.payload.data),
                currentIndex: state.currentIndex + action.payload.data.length,
                isLoading: false
            }
        case 'LOCATION/LOADING':
            return {
                ...state,
                isLoading: true
            }
        default:
            return state;
    }
};

export default reducer;