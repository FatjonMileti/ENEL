// Initializes the `offer` service on path `/offer`
const createService = require('./offer.class.js');
const hooks = require('./offer.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    name: 'offer',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/offer', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('offer');

  service.hooks(hooks);
};
