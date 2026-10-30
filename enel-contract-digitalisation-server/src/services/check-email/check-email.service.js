// Initializes the `checkSmsCode` service on path `/check-email`
const createService = require('./check-email.class.js');
const hooks = require('./check-email.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    name: 'check-email',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/check-email', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('check-email');

  service.hooks(hooks);
};
