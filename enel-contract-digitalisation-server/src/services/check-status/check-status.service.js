// Initializes the `checkStatus` service on path `/check-status`
const createService = require('./check-status.class.js');
const createModel = require('../../models/check-status.model');
const hooks = require('./check-status.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'check-status',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/check-status', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('check-status');

  service.hooks(hooks);
};
