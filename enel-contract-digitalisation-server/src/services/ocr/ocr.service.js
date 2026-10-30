// Initializes the `ocr` service on path `/ocr`
const createService = require('./ocr.class.js');
const hooks = require('./ocr.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'ocr',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/ocr', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('ocr');

  service.hooks(hooks);
};
