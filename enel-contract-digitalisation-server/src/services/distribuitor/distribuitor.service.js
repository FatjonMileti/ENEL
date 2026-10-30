// Initializes the `distribuitor` service on path `/distribuitor`
const createService = require('feathers-sequelize');
const createModel = require('../../models/distribuitor.model');
const hooks = require('./distribuitor.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'distribuitor',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/distribuitor', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('distribuitor');

  service.hooks(hooks);
};
