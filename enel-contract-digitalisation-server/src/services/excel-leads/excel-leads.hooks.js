const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { populateUser, checkPermission  } = require('../../hooks/session.js');

module.exports = {
  before: {
    all: [],
    find: [
      context => {
        if (context.params.query.accessToken && !context.params.headers.authorization) {
          context.params.headers.authorization = `Bearer ${context.params.query.accessToken}`;
          delete context.params.query.accessToken;
        }
      },
      authenticate('jwt'),
      populateUser,
      checkPermission('excelLeads.find'),
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
