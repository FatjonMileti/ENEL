// Initializes the `tip-serviciu` service on path `/tip-serviciu`
const createService = require('feathers-sequelize');
const createModel = require('../../models/tip-serviciu.model');
const hooks = require('./tip-serviciu.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'tip-serviciu',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/tip-serviciu', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('tip-serviciu');

  service.hooks(hooks);
};
