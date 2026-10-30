const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { sameUser, populateSession, notClosed, populateUser, requireType, checkPermission } = require('../../hooks/session.js');
const { USER_ROLE } = require('../../utils/enums.js');

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'),
      populateUser,
    ],
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
