// Initializes the `validate-offer` service on path `/validate-offer`
const createService = require('./validate-offer.class.js');
const hooks = require('./validate-offer.hooks');

module.exports = function (app) {

    const paginate = app.get('paginate');

    const options = {
        name: 'validate-offer',
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/validate-offer', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('validate-offer');
    service.hooks(hooks);
};
