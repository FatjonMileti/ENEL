const { NotFound } = require('@feathersjs/errors');
const hooks = require('feathers-hooks-common');
const { authenticate } = require("@feathersjs/authentication").hooks;
const { populateUser } = require('../../hooks/session.js');

module.exports = {
    before: {
        all: [],
        find: [hooks.disallow('external')],
        get: [
            authenticate('jwt'),
            populateUser,
        ],
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
