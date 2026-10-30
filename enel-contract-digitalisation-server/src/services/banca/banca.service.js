// Initializes the `banca` service on path `/banca`
const createService = require('feathers-sequelize');
const createModel = require('../../models/banca.model');
const hooks = require('./banca.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'banca',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/banca', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('banca');

  service.hooks(hooks);
};
