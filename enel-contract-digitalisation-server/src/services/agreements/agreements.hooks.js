const hooks = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [ hooks.disallow('external') ],
    get: [],
    create: [ hooks.disallow('external') ],
    update: [ hooks.disallow('external') ],
    patch: [ hooks.disallow('external') ],
    remove: [ hooks.disallow('external') ]
  },

  after: {
    all: [],
    find: [],
    get: [
      async context => {
        // Send only the html
        context.result = context.result.html;
      }
    ],
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
