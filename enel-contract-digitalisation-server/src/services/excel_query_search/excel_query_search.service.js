// Initializes the `excel` service on path `/excel`
const createService = require('./excel_query_search.class.js');
const hooks = require('./excel_query_search.hooks.js');
const { getDefaultReport} = require('./report');

module.exports = function (app) {
    const paginate = app.get('paginate');
    
    const options = {
        name: 'excelexcelquerysearch',
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/excel-query-report', createService(options), async (req, res, next) => {
        const { rows, params } = res.data;


        const xls = await getDefaultReport(app, rows);
        
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'report.xls');
        res.contentType = 'application/octet-stream';
        return res.send(Buffer.from(xls, 'utf8'));
    });
    // Get our initialized service so that we can register hooks and filters
    const service = app.service('excel-query-report');
    service.hooks(hooks);
};
