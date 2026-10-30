// Initializes the `document` service on path `/document`
const createService = require('./document.class.js');
const hooks = require('./document.hooks');

module.exports = function (app) {

  const paginate = app.get('paginate');

  const options = {
    name: 'document',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/document', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('document');

  service.hooks(hooks);
};
