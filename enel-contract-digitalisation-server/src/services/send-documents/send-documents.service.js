// Initializes the `send-documents` service on path `/send-documents`
const createService = require('./send-documents.class.js');
const hooks = require('./send-documents.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/send-documents', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('send-documents');

  service.hooks(hooks);
};
