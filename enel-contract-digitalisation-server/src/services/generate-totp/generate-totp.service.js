// Initializes the `generate-totp` service on path `/generate-totp`
const createService = require('./generate-totp.class.js');
const hooks = require('./generate-totp.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    name: 'generateTOTP',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/generateTOTP', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('generateTOTP');

  service.hooks(hooks);
};
