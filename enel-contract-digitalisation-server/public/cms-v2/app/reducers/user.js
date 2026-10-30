let initialState = {
    info: null,
    isAdmin: false,
    isFsdAdmin: false,
    isManager: false,
    isAuditor: false,
    isUser: false,

    count: 0,
    online: 0,
    active: 0,

    total: 0,
    sortColumn: '',
    ascending: false,
    list: [],

    currentIndex: 0,
    isLoading: false
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                info: action.payload,
                isAdmin: action.payload.role === 'admin',
                isFsdAdmin: action.payload.role === 'fsd_admin',
                isManager: action.payload.role === 'manager',
                isAuditor: action.payload.role === 'auditor',
                isUser: action.payload.role === 'user'
            }
        case 'INIT_USERS':
            return {
                ...state,
                count: action.payload.count,
                online: action.payload.online,
                active: action.payload.active
            }
        case 'INIT_AGENTS':
            return {
                ...state,
                list: action.payload.data,
                total: action.payload.total,
                sortColumn: action.payload.sortColumn,
                ascending: action.payload.ascending,
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'AGENTS_LOADING':
            return {
                ...state,
                isLoading: true
            }
        case 'APPEND_AGENTS':
            return {
                ...state,
                total: action.payload.total,
                list: state.list.concat(action.payload.data),
                currentIndex: state.currentIndex + action.payload.data.length,
                isLoading: false
            }
        default:
            return state;
    }
};

export default reducer;