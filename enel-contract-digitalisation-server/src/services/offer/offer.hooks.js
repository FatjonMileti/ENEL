const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { sameUser, populateSession, notClosed, populateUser, requireType, /*checkLimit,*/ validateConsumption, checkPermission } = require('../../hooks/session.js');
const { USER_ROLE } = require('../../utils/enums.js');
module.exports = {
    before: {
        all: [],
        find: [hooks.disallow('external')],
        get: [hooks.disallow('external')],
        create: [
            authenticate('jwt'),
            populateUser, 
            checkPermission('offer.create'),
            populateSession,
            sameUser,
            notClosed,
            requireType,
            //checkLimit('telefon'),
            //checkLimit('email'),
            validateConsumption,
        ],
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

