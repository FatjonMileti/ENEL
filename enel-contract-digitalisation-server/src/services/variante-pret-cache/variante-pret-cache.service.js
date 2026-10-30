// Initializes the `variante-pret` service on path `/variante-pret`
const hooks = require('./variante-pret-cache.hooks.js');
const createService = require('feathers-sequelize');
const createModel = require("../../models/variante-pret-cache.model");

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'variante-pret-cache',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/variante-pret-cache', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('variante-pret-cache');

  service.hooks(hooks);
};
