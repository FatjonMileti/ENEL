const createService = require('./sms-validation.class.js');
const hooks = require('./sms-validation.hooks');
const smsValidation = require('../../models/sms-validation.js')

module.exports = function (app) {
  const paginate = app.get('paginate');
  const Model = smsValidation(app);

  const options = {
    name: 'sms-validation',
    Model,
    paginate
  };

  const smsValidationService = createService(options);
  app.use('/sms-validation', smsValidationService);

  app.use('/sms-validation/restart', {
    create: async (data, params) => {
      return smsValidationService.restart(data, params);
    }
  });

  app.use('/sms-validation/check', {
    get: async (data, params) => {
      return smsValidationService.get(data, params);
    }
  });

  const service = app.service('sms-validation');

  service.hooks(hooks);
  
  app.service('sms-validation/restart').hooks({
    before: {
      create: hooks.before.create
    },
    after: hooks.after.create,
    error: hooks.error.create
  });

  app.service('sms-validation/check').hooks({
    before: {
      get: hooks.before.get
    },
    after: hooks.after.create,
    error: hooks.error.create
  });
}; 