// Initializes the `session` service on path `/session`
const createService = require('./voucher.class.js');
const hooks = require('./voucher.hooks');

module.exports = function (app) {
  const options = {
    name: 'voucher',
  };

  // Initialize our service with any options it requires
  app.use('/voucher', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('voucher');

  service.hooks(hooks);
};
