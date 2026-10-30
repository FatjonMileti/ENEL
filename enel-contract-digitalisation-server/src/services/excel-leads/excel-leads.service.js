const createService = require('./excel-leads.class.js');
const hooks = require('./excel-leads.hooks');
const { getDefaultReport } = require('./report');


module.exports = function (app) {
  const paginate = app.get('paginate');

  const options = {
    name: 'excel-leads',
    paginate
  };

  // Initialize our service with any options it requires
app.use('/excel-leads', createService(options), async (req, res, next) => {
      const { leads } = res.data;
      const xls = await getDefaultReport(app, leads);
      
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'leads.xls');
      res.contentType = 'application/octet-stream';
      return res.send(Buffer.from(xls, 'utf8'));
    });

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('excel-leads');

  service.hooks(hooks);
};
