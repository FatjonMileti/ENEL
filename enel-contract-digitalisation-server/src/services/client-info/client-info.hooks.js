const hooks = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;
const { BadRequest } = require('@feathersjs/errors');
const { sameUser, populateSession, notClosed, populateUser, checkPermission, clientApp, inApps } = require('../../hooks/session.js');
const { hasPermission } = require('../../utils/permissions.js');
const { USER_ROLE, USER_TYPE } = require('../../utils/enums.js');
const rateLimitUser = require('../../hooks/rateLimitUser.js');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [hooks.disallow('external')],
        get: [
            clientApp,
            inApps([process.env.ANDROID_APP1, process.env.TELESALES_AGENT_APP]),
            populateUser,
            rateLimitUser(10, 'second', 10, 1, 'minute'),
            checkPermission('clientInfo.get'),
        ],
        create: [
            clientApp,
            inApps([process.env.WEB_APP, process.env.TELESALES_AGENT_APP]),
            populateUser,
            rateLimitUser(10, 'second', 10),
            checkPermission('clientInfo.create'),
            async (context) => {
                if (hasPermission(context.params.user.role, 'clientInfo.session')) {
                    context = await populateSession(context);
                    context = await sameUser(context);
                    context = await notClosed(context);
                }
            }],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [hooks.disallow('external')],
        get: [],
        create: [],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    },

    error: {
        all: [],
        find: [hooks.disallow('external')],
        get: [],
        create: [],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    }
};
