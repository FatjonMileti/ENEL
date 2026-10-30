// Initializes the `pdf-dir` service on path `/pdf-dir`
const createService = require('./pdf.class.js');
const hooks = require('./pdf.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    name: 'pdf',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/pdf', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('pdf');

  service.hooks(hooks);
};
