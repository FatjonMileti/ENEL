const createService = require('./excel-charts.class.js');
const hooks = require('./excel-charts.hooks');
const XLSXChart = require ("../../xlsx-chart/chart.js");
const xlsxChart = new XLSXChart();

module.exports = function (app) {
  const paginate = app.get('paginate');

  const options = {
    name: 'excel-charts',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/excel-charts', createService(options), (req, res, next) => {

    const fields = res.data.data.map(item => item.label);
    const activated = {};
    const pending = {};
    const errored = {};

    res.data.data.forEach(item => {
      activated[item.label] = item.activated;
      pending[item.label] = item.pending;
      errored[item.label] = item.errored;
    })

    const opts = {
        file: "PPC Performance Dashboard.xlsx",
        chart: "column",
        chartTitle: `Raport de activitate ${res.data.startDate} - ${res.data.endDate}`,
        titles: [
            "Activated",
            "Pending for activation",
            "Cancelled",
        ],
        fields,
        data: {
            "Activated": activated,
            "Pending for activation": pending,
            "Cancelled": errored,
        }
    };

    xlsxChart.generate(opts, (err, data) => {
        res.set({
          "Content-Type": "application/octet-stream",
          "Content-Length": data.length
        });
        return res.send(data.toString('base64'));
    });
  });

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('excel-charts');

  service.hooks(hooks);
};
