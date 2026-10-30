// Initializes the `checkSmsCode` service on path `/check-sms-code`
const createService = require('./check-sms-code.class.js');
const hooks = require('./check-sms-code.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    name: 'checkClientCode',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/checkClientCode', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('checkClientCode');

  service.hooks(hooks);
};
