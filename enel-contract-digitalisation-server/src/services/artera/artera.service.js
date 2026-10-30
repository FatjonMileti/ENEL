// Initializes the `artera` service on path `/artera`
const createService = require('feathers-sequelize');
const createModel = require('../../models/artera.model');
const hooks = require('./artera.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'artera',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/artera', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('artera');

  service.hooks(hooks);
};
