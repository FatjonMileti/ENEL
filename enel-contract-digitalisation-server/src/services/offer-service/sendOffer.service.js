// Initializes the `sign` service on path `/sign`
const createService = require('./sendOffer.class.js');
const hooks = require('./sendOffer.hooks');
const createModel = require('../../models/smslogs.model.js');
module.exports = function (app) {
  
  const paginate = app.get('paginate');
  const Model = createModel(app);
  const options = {
    name: 'offer-service',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/offer-service', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('offer-service');

  service.hooks(hooks);
};
