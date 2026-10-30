const hooks = require('feathers-hooks-common');
//const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
  before: {
    all: [ hooks.disallow('external') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ hooks.disallow('external') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ hooks.disallow('external') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
