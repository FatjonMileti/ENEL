// Initializes the `validate-nlc` service on path `/validate-nlc`
const createService = require('./validate-nlc.class.js');
const hooks = require('./validate-nlc.hooks');

module.exports = function (app) {

    const paginate = app.get('paginate');

    const options = {
        name: 'validate-nlc',
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/validate-nlc', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('validate-nlc');
    service.hooks(hooks);
};
