// Initializes the `tokens` service on path `/tokens`
const createService = require('feathers-sequelize');
const createModel = require('../../models/token-blacklist');
const hooks = require('./token-blacklist.hooks');

module.exports = function(app) {
    const Model = createModel(app);
    const paginate = app.get('paginate');

    const options = {
        Model,
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/token-blacklist', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service('token-blacklist');

    service.hooks(hooks);
};