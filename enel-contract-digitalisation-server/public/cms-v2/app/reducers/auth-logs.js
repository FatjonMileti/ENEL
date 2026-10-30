export default () => {
    const initialState = {
        total: 0,
        data: [],
        currentIndex: 0,
        isLoading: false,
        error: false
    };

    return (state = initialState, action) => {
        switch (action.type) {
            case `AUTH_LOGS_LOADING`:
                return {
                    ...state,
                    isLoading: true
                };
            case `AUTH_LOGS_INIT`:
                return {
                    ...state,
                    total: action.payload.total || 0,
                    data: action.payload.data || [],
                    currentIndex: action.payload.data ? action.payload.data.length : 0,
                    error: action.payload.error || false,
                    isLoading: false
                };
            case `AUTH_LOGS_APPEND`:
                return {
                    ...state,
                    total: action.payload.total,
                    data: state.data.concat(action.payload.data),
                    currentIndex: state.currentIndex + (action.payload.data ? action.payload.data.length : 0),
                    error: action.payload.error,
                    isLoading: false
                };
            default:
                return state;
        }
    };
}