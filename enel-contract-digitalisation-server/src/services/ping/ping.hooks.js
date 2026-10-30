const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { MethodNotAllowed, NotFound, BadRequest } = require('@feathersjs/errors');
const moment = require('moment');

module.exports = {
    before: {
        all: [],
        find: [async context => {
            const sequelize = context.app.get('sequelizeClient');
            const LocationModel = sequelize.model('location');
            const errors = [];

            context.params.sequelize = {
                include: [{
                    model: LocationModel,
                    attributes: ['name', 'lat', 'lon', 'company', 'zone', 'address', 'pingIntervalSeconds'],
                    as: 'location'
                }]
            };

            if (context.params.query.$group) {
                let $group = context.params.query.$group;
                if ($group.match('stats')) {
                    // stats can be retrieved just for a specific location
                    if (!context.params.query.locationId)
                        throw new BadRequest('The "locationId" parameter is required');

                    $group = $group.split('.')[1];
                    context.params.sequelize = {
                        attributes: [[sequelize.fn('date_trunc', $group, sequelize.col('receivedDate')), $group], sequelize.fn('count', $group)],
                        group: sequelize.fn('date_trunc', $group, sequelize.col('receivedDate')),
                    }
                } else {
                    context.params.sequelize = {
                        attributes: [$group, sequelize.fn('count', sequelize.col($group))],
                        group: $group,
                    }
                }
            }

            context.$group = context.params.query.$group;

            delete context.params.query.include;
            delete context.params.query.$group;
            return context;
        }],
        get: [hooks.disallow('external')],
        create: [async context => {
            let now = moment();

            let errors = [];
            let locationId = context.data.locationId;
            if (!locationId)
                errors.push('The "locationId" parameter is required');

            let key = context.data.key;
            if (!key)
                errors.push('The "key" parameter is required');

            let requestDate = context.data.requestDate;
            if (!requestDate)
                errors.push('The "requestDate" parameter is required')
            else if (!moment(requestDate).isValid())
                errors.push('The "requestDate" parameter is not a valid ISO date');

            requestDate = moment(requestDate);

            let pingIntervalSeconds = context.data.pingIntervalSeconds;
            if (!pingIntervalSeconds)
                errors.push('The "pingIntervalSeconds" parameter is required');

            if (errors.length > 0)
                throw new BadRequest(errors);

            // get location from db
            let db_locations = (await context.app.service('location').find({ query: { id: locationId, key: key } })).data;
            if (!db_locations || db_locations.length === 0)
                throw new NotFound('Location not found or invalid key');

            await context.app.service('location').patch(locationId, {
                lastPingAt: requestDate.toDate(),
                pingIntervalSeconds: pingIntervalSeconds
            });

            let msDiff = now.diff(requestDate, 'milliseconds');
            context.data = {
                locationId: locationId,
                requestDate: requestDate.toDate(),
                receivedDate: now.toDate(),
                delayMs: msDiff
            }

            return context;
        }],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [async (context) => {
            if (context.$group && context.$group.match('stats')) {
                const $group = context.$group.split('.')[1];
                const data = context.result.data;
                const { pingIntervalSeconds } = await context.app.service('location').get(context.params.query.locationId);

                data.forEach((item) => {
                    if ($group === 'day') {
                        item.date = item.day;
                        if (moment().subtract(1, 'day').isBefore(moment(item.day))) {
                            item.total = moment().diff(moment(item.day), 'seconds') / pingIntervalSeconds;
                        } else {
                            item.total = 24 * 3600 / pingIntervalSeconds;
                        }
                    } else if ($group === 'week') {
                        item.date = item.week;
                        if (moment().subtract(1, 'week').isBefore(moment(item.week))) {
                            item.total = moment().diff(moment(item.week), 'seconds') / pingIntervalSeconds;
                        } else {
                            item.total = 7 * 24 * 3600 / pingIntervalSeconds;
                        }
                    } else if ($group === 'month') {
                        item.date = item.month;
                        if (moment().subtract(1, 'month').isBefore(moment(item.month))) {
                            item.total = moment().diff(moment(item.month), 'seconds') / pingIntervalSeconds;
                        } else {
                            item.total = moment(item.month).daysInMonth() * 24 * 3600 / pingIntervalSeconds;
                        }
                    }

                    item.online = parseInt(item.count);
                    item.offline = parseInt(item.total - item.online);
                    delete item.count;
                    delete item.day;
                    delete item.week;
                    delete item.month;
                });
            }

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
