// Initializes the `ping-excel` service on path `/ping-excel`
const createService = require('./ping-excel.class.js');
const hooks = require('./ping-excel.hooks');
const moment = require('moment');

module.exports = function (app) {
  const paginate = app.get('paginate');

  const options = {
    name: 'ping-excel',
    paginate
  };

  function strip(str) {
    return str.replace(/\"/g, '\'').replace((/  |\r\n|\n|\r|\t/gm), "", ' ');
  }

  // Initialize our service with any options it requires
  app.use('ping-excel', createService(options), (req, res, next) => {
    let pings = res.data;

    let xls = [
      'Location',
      'Request Date',
      'Received Date',
      'Delay ms',
      'Latitude',
      'Longitude',
      'Company',
      'Zone',
      'Address',
      'Ping Interval Seconds',
    ].join('\t');
    for (const p of pings) {
      xls += `\n${[
        p['location.name'],
        moment(p.requestDate).format('HH:mm:ss DD.MM.YYYY'),
        moment(p.receivedDate).format('HH:mm:ss DD.MM.YYYY'),
        p.delayMs,
        p['location.lat'],
        p['location.lon'],
        p['location.company'],
        p['location.zone'],
        p['location.address'],
        p['location.pingIntervalSeconds'],
      ].join('\t')}`;
    }
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'pings.xls');
    res.contentType = 'application/octet-stream';
    return res.send(Buffer.from(xls, 'utf8'));
  });

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('ping-excel');

  service.hooks(hooks);
};
