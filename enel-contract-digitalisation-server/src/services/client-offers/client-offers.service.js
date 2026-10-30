// Initializes the `client-offers` service on path `/client-offers`
const createService = require('./client-offers.class.js');
const hooks = require('./client-offers.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'client-offers',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/client-offers', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('client-offers');

  service.hooks(hooks);
};
