// Initializes the `gama-serviciu` service on path `/gama-serviciu`
const createService = require('feathers-sequelize');
const createModel = require('../../models/gama-serviciu.model');
const hooks = require('./gama-serviciu.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'gama-serviciu',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/gama-serviciu', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('gama-serviciu');

  service.hooks(hooks);
};
