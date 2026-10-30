// Initializes the `document` service on path `/document`
const createService = require('./documentOffer.class.js');
const hooks = require('./documentOffer.hooks');
const createModel = require('../../models/documentoff.model');
module.exports = function (app) {

  const paginate = app.get('paginate');
  const Model = createModel(app);
  const options = {
    name: 'documentoffer',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/documentoffer', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('documentoffer');

  service.hooks(hooks);
};
