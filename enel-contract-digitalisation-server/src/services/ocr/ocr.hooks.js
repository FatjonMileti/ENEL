const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { sameUser, populateSession, notClosed, populateUser } = require('../../hooks/session.js');

module.exports = {
  before: {
    all: [],
    find: [hooks.disallow('external')],
    get: [hooks.disallow('external')],
    create: [authenticate('jwt'), populateUser, populateSession, sameUser, notClosed],
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
