const createService = require('./recaptcha.class');
const hooks = require('./recaptcha.hooks');

module.exports = function (app) {
    const options = {};
    app.use('/recaptcha', createService(options));

    const service = app.service('recaptcha');
    service.hooks(hooks);
};
