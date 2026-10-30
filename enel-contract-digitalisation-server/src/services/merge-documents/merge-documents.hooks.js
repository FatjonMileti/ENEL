const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { sameUser, populateSession, populateUser, requireType } = require('../../hooks/session.js');

module.exports = {
    before: {
        find: [hooks.disallow('external')],
        get: [authenticate('jwt'), populateUser, populateSession, sameUser, requireType],
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
