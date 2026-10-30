// Initializes the `tip-canal` service on path `/tip-canal`
const createService = require('feathers-sequelize');
const createModel = require('../../models/tip-canal.model');
const hooks = require('./tip-canal.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'tip-canal',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/tip-canal', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('tip-canal');

  service.hooks(hooks);
};
