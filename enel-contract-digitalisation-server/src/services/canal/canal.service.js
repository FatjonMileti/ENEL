// Initializes the `canal` service on path `/canal`
const createService = require('feathers-sequelize');
const createModel = require('../../models/canal.model');
const hooks = require('./canal.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'canal',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/canal', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('canal');

  service.hooks(hooks);
};
