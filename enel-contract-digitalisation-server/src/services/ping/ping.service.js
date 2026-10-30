// Initializes the `ping` service on path `/ping`
const createService = require('feathers-sequelize');
const createModel = require('../../models/ping.model');
const hooks = require('./ping.hooks');
const moment = require('moment');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.get('/ping/time', (req, res, next) => {
    return res.status(200).json({
      time: moment().toISOString()
    });
  });
  app.use('/ping', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('ping');

  service.hooks(hooks);
};
