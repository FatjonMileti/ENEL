const createService = require('./whitelist.class.js');
const createModel = require('../../models/whitelist.model');
const hooks = require('./whitelist.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'whitelist',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/whitelist', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('whitelist');

  service.hooks(hooks);
};
