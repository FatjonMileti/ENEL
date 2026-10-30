const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');

String.prototype.capitalize = function () {
  return this.toLowerCase().replace(/(?:^|\s|-)\S/g, function (a) {
    return a.toUpperCase();
  });
};

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [async context => {
      if (context.params.query && context.params.query.jud_distributie) {
        var judet = context.params.query.jud_distributie;
        switch (judet.toLowerCase()) {
          case 'dimbovita':
            judet = 'dambovita';
            break;
          // case 'satu-mare':
          //   judet = 'satu mare';
          //   break;
          case 'vilcea':
            judet = 'valcea';
            break;
        }
        context.params.query.jud_distributie = judet.capitalize();
      }

      return context;
    }],
    get: [],
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
