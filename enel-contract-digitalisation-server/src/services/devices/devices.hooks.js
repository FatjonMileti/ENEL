const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');


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
        all: [hooks.disallow('external')],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [hooks.disallow('external')],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};