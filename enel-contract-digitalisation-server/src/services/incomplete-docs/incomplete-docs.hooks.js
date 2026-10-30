const { authenticate } = require("@feathersjs/authentication").hooks;
const hooks = require("feathers-hooks-common");
const { populateSession, populateUser } = require('../../hooks/session.js');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [hooks.disallow()],
    get: [hooks.disallow()],
    create: [populateUser],
    update: [hooks.disallow()],
    patch: [hooks.disallow()],
    remove: [hooks.disallow()]
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
