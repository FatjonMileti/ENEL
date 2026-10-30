// Initializes the `agreements` service on path `/agreements`
const createService = require('feathers-sequelize');
const createModel = require('../../models/agreements.model');
const hooks = require('./agreements.hooks');
const logger = require('../../utils/logger');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'agreements',
    Model,
    paginate
  };

  // Initialize the service and set the response to text/html
  app.use('/agreements', createService(options), (req, res) => {
    res.type('html');
    res.send(res.data);
  });

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('agreements');

  service.hooks(hooks);
};
