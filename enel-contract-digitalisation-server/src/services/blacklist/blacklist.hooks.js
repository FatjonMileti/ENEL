const { NotFound } = require('@feathersjs/errors');
const hooks = require('feathers-hooks-common');
const { authenticate } = require("@feathersjs/authentication").hooks;
const { populateUser, populateSession, checkPermission } = require('../../hooks/session.js');

populateBlacklistSession = context => {
    const email = context.id;
    context.id = undefined;
    populateSession(context);
    context.id = email;
    return context;
}

module.exports = {
    before: {
        all: [],
        find: [
            authenticate('jwt'),
            populateUser,
            checkPermission('blacklist.find'),
        ],
        get: [
            authenticate('jwt'),
            populateUser,
            populateBlacklistSession,
        ],
        create: [
            authenticate('jwt'),
            populateUser,
            checkPermission('blacklist.create'),
        ],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [
            authenticate('jwt'),
            populateUser,
            checkPermission('blacklist.remove'),
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
