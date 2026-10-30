const hooks = require('feathers-hooks-common');
const { authenticate } = require("@feathersjs/authentication").hooks;
const { populateUser, checkPermission } = require('../../hooks/session.js');

module.exports = {
    before: {
        all: [],
        find: [
            authenticate('jwt'),
            populateUser,
            checkPermission('whitelist.find'),
        ],
        get: [
            authenticate('jwt'),
            populateUser,
        ],
        create: [
            authenticate('jwt'),
            populateUser,
            checkPermission('whitelist.create'),
        ],
        update: [hooks.disallow('external')],
        patch: [
            authenticate('jwt'),
            populateUser,
            checkPermission('whitelist.patch'),
        ],
        remove: [
            authenticate('jwt'),
            populateUser,
            checkPermission('whitelist.remove'),
        ]
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
