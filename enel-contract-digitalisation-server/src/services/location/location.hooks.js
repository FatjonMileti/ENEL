const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const moment = require('moment');

const TIME_MARGIN = 180; // seconds
const STATUS = {
    offline: 'offline',
    online: 'online',
};

const getLocationsInfo = async (context, period) => {
    const pings = await context.app.service('ping').find({
        query: {
            receivedDate: { $gte: moment().startOf(period).toDate() },
            $sort: { receivedDate: -1 }
        }
    });

    const info = {};
    for (let i = 0; i < pings.data.length; i++) {
        const ping = pings.data[i];
        if (info[`_${ping.locationId}`]) {
            info[`_${ping.locationId}`].sum += ping.delayMs;
            info[`_${ping.locationId}`].count++;
        } else {
            info[`_${ping.locationId}`] = {
                sum: ping.delayMs,
                count: 1,
                lastDelayMs: ping.delayMs,
            };
        }
    }

    return info;
};

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [async (context) => {
            const dayInfo = await getLocationsInfo(context, 'day');
            const weekInfo = await getLocationsInfo(context, 'week');

            context.result.data = context.result.data.map((location) => {
                const lastPing = moment(location.lastPingAt);
                if (lastPing.add(parseInt(location.pingIntervalSeconds) + TIME_MARGIN, 'seconds').isBefore(moment())) {
                    location.status = STATUS.offline;
                } else {
                    location.status = STATUS.online;
                }

                if (dayInfo[`_${location.id}`]) {
                    location.lastDelayMs = dayInfo[`_${location.id}`].lastDelayMs;
                    location.averageDelayToday = parseInt(dayInfo[`_${location.id}`].sum / dayInfo[`_${location.id}`].count);
                }

                if (weekInfo[`_${location.id}`]) {
                    location.averageDelayWeek = parseInt(weekInfo[`_${location.id}`].sum / weekInfo[`_${location.id}`].count);
                }

                return location;
            });

            return context;
        }],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
