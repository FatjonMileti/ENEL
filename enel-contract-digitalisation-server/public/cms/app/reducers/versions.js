let initialState = {
    latest: {},
    isLoading: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'APP_LOG/LATEST':
            return {
                ...state,
                latest: action.payload,
                isLoading: false,
            }
        case 'APP_LOG/LOADING':
            return {
                ...state,
                isLoading: true,
            }
        default:
            return state;
    }
};

export default reducer;