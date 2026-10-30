const moment = require('moment');

let initialState = {
    isLoading: false,

    invoiceDate: moment('2018-06-25'),
    maxScans: 500000,
    packageSize: 10000,
    monthlyScans: []
};

let dateIterator = moment(initialState.invoiceDate);
while (moment().startOf('day').isSameOrAfter(dateIterator)) {
    initialState.monthlyScans.push({ date: moment(dateIterator), value: 0 });
    dateIterator.add(1, 'month');
}
initialState.monthlyScans = initialState.monthlyScans.reverse();

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INIT_OCR':
            return {
                ...state,
                monthlyScans: action.payload,
                isLoading: false
            }
        case 'OCR_LOADING':
            return {
                ...state,
                isLoading: true
            }
        default:
            return state;
    }
};

export default reducer;