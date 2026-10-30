// Initializes the `change-password` service on path `/change-password`
const createService = require('./incomplete-docs.class.js');
const hooks = require("./incomplete-docs.hooks");

module.exports = function (app) {
    const paginate = app.get('paginate');
    const options = {
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/incomplete-docs', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service("incomplete-docs");

    service.hooks(hooks);
};
