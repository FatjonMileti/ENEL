// Initializes the `discount` service on path `/discount`
const createService = require('./discount.class.js');
const hooks = require('./discount.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'discount',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/discount', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('discount');

  service.hooks(hooks);
};
