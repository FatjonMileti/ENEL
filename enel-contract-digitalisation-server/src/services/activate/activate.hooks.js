const hooks = require('feathers-hooks-common');
const { populateSession, notClosed, requireType, checkHash, clientApp } = require('../../hooks/session.js');
const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
    before: {
        all: [],
        find: [hooks.disallow('external')],
        get: [hooks.disallow('external')],
        create: [populateSession, notClosed, requireType, clientApp, async context => {
            if (!context.params.query.hash)
                return authenticate('jwt')(context);
            else return checkHash(context);
        }],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [populateSession, notClosed, requireType, async context => {
            if (!context.params.query.hash)
                return authenticate('jwt')(context);
            else return checkHash(context);
        }]
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
