import _ from 'lodash';

let initialState = {
    total: 0,
    limit: 0,
    skip: false,
    data: [],
    groups: [],
    sortColumn: 'createdAt',
    ascending: false,
    isLoading: false,
    currentGroup: null,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INVOICE_EXAMPLES/ALL':
            const groups = _.groupBy(action.payload.data, (item) => {
                return JSON.stringify({
                    type: item.type,
                    provider: item.furnizor_id,
                    county: item.county,
                    market: item.market,
                });
            });
            
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                groups: Object.keys(groups).map(key => JSON.parse(key)),
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'INVOICE_EXAMPLES/CLEAR':
            return initialState;
        case 'INVOICE_EXAMPLES/LOADING':
            return {
                ...state,
                isLoading: true
            }
        case 'INVOICE_EXAMPLES/SET_CURRENT_GROUP':
            return {
                ...state,
                currentGroup: action.payload.currentGroup,
            }
        case 'INVOICE_EXAMPLES/UNSET_CURRENT_GROUP':
            return {
                ...state,
                currentGroup: null
            }
        default:
            return state;
    }
};

export default reducer;