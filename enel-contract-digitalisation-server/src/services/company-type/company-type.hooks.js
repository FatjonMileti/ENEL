const {authenticate} = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [hooks.disallow('external')],
        create: [hooks.disallow('external')],
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
