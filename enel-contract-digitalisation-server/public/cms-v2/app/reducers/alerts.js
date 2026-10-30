let initialState = {
    total: 0,
    limit: 0,
    skip: false,
    data: [],
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ALERTS/ALL':
            return {
                total: action.payload.total || 0,
                data: action.payload.data || [],
            }
        default:
            return state;
    }
};

export default reducer;