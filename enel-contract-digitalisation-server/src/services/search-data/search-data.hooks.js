const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');

module.exports = {
    before: {
        all: [authenticate('jwt'), async (context) => {
            await context.app.service('query-report').create({
                requestType: context.params.query.type,
                  searchCriteria: context.params.query.code,
                  userMarca: context.params.payload.user.username,
                  userFullName: context.params.payload.user.fullname,
                  partenerName: context.params.payload.user.partenerName,
                  employed: context.params.payload.user.employed,
                  type: context.params.payload.user.type,
                  clientId: context.params.payload.user.cid,
                  companyId: context.params.payload.user.companyId
            });
        }],
        // all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [],
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
