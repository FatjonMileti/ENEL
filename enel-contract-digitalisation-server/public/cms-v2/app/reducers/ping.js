import _ from 'lodash';
import moment from 'moment';

let initialState = {
    total: 0,
    limit: 0,
    skip: false,
    data: [],
    stats: [],
    delay: {
        averageByLocation: {}
    },
    sortColumn: 'receivedDate',
    ascending: false,
    isLoading: false,
};

const getAverageByLocation = (items) => {
    const pings = [...items].sort((a, b) => {
        try {
            return new Date(a.receivedDate) - new Date(b.receivedDate);
        } catch (e) {
            return 0;
        }
    });

    let groupByLocation = _.groupBy(pings, item => `_${item.locationId}`);

    _.forEach(groupByLocation, (items, key) => {
        groupByLocation[key] = {
            byDay: _.groupBy(items, item => moment(item.receivedDate).format('DD.MM.YYYY'))
        };
    });
    
    _.forEach(groupByLocation, (group, locationKey) => {
        _.forEach(group.byDay, (items, dayKey) => {
            groupByLocation[locationKey]['byDay'][dayKey] = Math.floor(_.mean(_.map(items, item => item.delayMs)));
        });
    });

    return groupByLocation;
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'PING/ALL':
            return {
                ...state,
                total: action.payload.total || 0,
                data: action.payload.data || [],
                delay: {
                    averageByLocation: getAverageByLocation(action.payload.data)
                },
                currentIndex: action.payload.data.length,
                isLoading: false
            }
        case 'PING/STATS':
            return {
                ...state,
                stats: action.payload.data,
            }
        case 'PING/LOADING':
            return {
                ...state,
                isLoading: true
            }
        default:
            return state;
    }
};

export default reducer;