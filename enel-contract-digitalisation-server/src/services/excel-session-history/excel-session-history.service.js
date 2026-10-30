// Initializes the `excel` service on path `/excel`
const createService = require('./excel-session-history.class.js');
const hooks = require('./excel-session-history.hooks');
const { getDefaultReport, getDetailedReport, getReportForFsdAdmin} = require('./report');

module.exports = function (app) {
    const paginate = app.get('paginate');
    
    const options = {
        name: 'excel-session-history',
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/excel-session-history', createService(options), async (req, res, next) => {
        const { sessions, params } = res.data;


        const xls = params.query.$detailed ?
            await getDetailedReport(app, sessions) : await getDefaultReport(app, sessions);
        
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'sessions-report.xls');
        res.contentType = 'application/octet-stream';
        return res.send(Buffer.from(xls, 'utf8'));
    });

    // app.use('/excel_fsd', createService(options), async (req, res, next) => {
    //     const { sessions, params } = res.data;
    //     console.log({sessions})
    //     const xls =  await getReportForFsdAdmin(app, sessions);
    //
    //     res.setHeader('Content-Disposition', 'attachment; filename=' + 'sessions-report.xls');
    //     res.contentType = 'application/octet-stream';
    //     return res.send(Buffer.from(xls, 'utf8'));
    // });

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('excel-session-history');
    service.hooks(hooks);
};
