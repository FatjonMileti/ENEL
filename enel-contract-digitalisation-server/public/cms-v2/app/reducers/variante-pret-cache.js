let initialState = {
    total: 0,
    data: [],
    sortColumn: 'createdAt',
    ascending: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'VARIANTE_PRET/SORT':
            return {
                ...state,
                ascending: !state.ascending
            }
        case 'VARIANTE_PRET/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                isLoading: false,
                currentIndex: action.payload.data.length,
            }
        case 'VARIANTE_PRET/VARIANTE_PRET_SYNC':
            return {
                ...state,
                syncing: action.payload.syncing,
            }
        case 'VARIANTE_PRET/VARIANTE_PRET_LOADING':
            return {
                ...state,
                isLoading: true
            }
        case 'VARIANTE_PRET/APPEND':
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
