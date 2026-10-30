// Initializes the `checkPod` service on path `/check-pod`
const createService = require('./check-pod.class.js');
const hooks = require('./check-pod.hooks');

module.exports = function (app) {
  const paginate = app.get('paginate');

  const options = {
    name: 'check-pod',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/check-pod', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('check-pod');

  service.hooks(hooks);
};
