// Initializes the `furnizor` service on path `/furnizor`
const createService = require('feathers-sequelize');
const createModel = require('../../models/furnizor.model');
const hooks = require('./furnizor.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'furnizor',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/furnizor', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('furnizor');

  service.hooks(hooks);
};
