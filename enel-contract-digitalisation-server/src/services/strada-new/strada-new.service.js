// Initializes the `strada` service on path `/strada`
const createService = require('feathers-sequelize');
const createModel = require('../../models/strada.model');
const hooks = require('./strada.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'strada-new',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/strada-new', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('strada-new');

  service.hooks(hooks);
};
