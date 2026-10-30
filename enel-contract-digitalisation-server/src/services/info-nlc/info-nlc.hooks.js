const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { clientApp } = require('../../hooks/session.js');
const rateLimitUser = require('../../hooks/rateLimitUser.js');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [hooks.disallow('external')],
    get: [clientApp, rateLimitUser(10, 'second', 10, 1, 'minute')],
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
