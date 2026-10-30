const filehandler = require('./filehandler');
const logger = require('./logger');
// const pdfSign = require('./pdf-sign');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
    app.use('/', logger());
    app.use(['/document','/documentoffer', '/ocr', '/invoice-examples'], filehandler());
};
