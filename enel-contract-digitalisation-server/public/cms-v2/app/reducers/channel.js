let initialState = {
    total: 0,
    sortColumn: '',
    ascending: false,
    data: [],
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CHANNEL/ALL':
            return {
                total: action.payload.total || 0,
                data: action.payload.data || [],
            }
        default:
            return state;
    }
};

export default reducer;