export default (KEY, LOGS = true) => {
    const initialState = {
        total: 0,
        data: [],
        currentIndex: 0,
        isLoading: false,
        error: false
    };

    return (state = initialState, action) => {
        switch (action.type) {
            case `${KEY}/${LOGS ? 'LOGS' : 'ERR'}_LOADING`:
                return {
                    ...state,
                    isLoading: true
                };
            case `${KEY}/${LOGS ? 'LOGS' : 'ERR'}_INIT`:
                return {
                    ...state,
                    total: action.payload.total || 0,
                    data: action.payload.data || [],
                    currentIndex: state.currentIndex + (action.payload.data ? action.payload.data.length : 0),
                    error: action.payload.error || false,
                    isLoading: false
                };
            case `${KEY}/${LOGS ? 'LOGS' : 'ERR'}_APPEND`:
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