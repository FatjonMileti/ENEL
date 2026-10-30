// Initializes the `judet` service on path `/judet`
const createService = require('feathers-sequelize');
const createModel = require('../../models/judet.model');
const hooks = require('./judet.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'judet',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/judet', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('judet');

  service.hooks(hooks);
};
