// Initializes the `info-nlc` service on path `/info-nlc`
const createService = require('./info-nlc.class.js');
const hooks = require('./info-nlc.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'info-nlc',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/info-nlc', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('info-nlc');

  service.hooks(hooks);
};
