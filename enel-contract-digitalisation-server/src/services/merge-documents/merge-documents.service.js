// Initializes the `merge-documents` service on path `/merge-documents`
const createService = require('./merge-documents.class.js');
const hooks = require('./merge-documents.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'merge-documents',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/merge-documents', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('merge-documents');

  service.hooks(hooks);
};
