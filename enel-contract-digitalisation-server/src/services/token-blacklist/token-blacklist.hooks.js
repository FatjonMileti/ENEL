const hooks = require('feathers-hooks-common');
const { authenticate } = require("@feathersjs/authentication").hooks;
const { populateUser } = require('../../hooks/session.js');


module.exports = {
    before: {
        all: [],
        find: [
            authenticate('jwt'),
            populateUser,        ],
        get: [
            authenticate('jwt'),
            populateUser,
        ],
        create: [
            authenticate('jwt'),
            populateUser,
        ],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [
            authenticate('jwt'),
            populateUser,
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
