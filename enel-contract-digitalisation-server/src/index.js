/* eslint-disable no-console */

require('dotenv').config();
const fs = require('fs');

var path = require('path');
global.uploadpath = path.join(path.resolve(__dirname), '../uploads');
global.variantePretSyncing = path.join(path.resolve(__dirname), '../variante_pret_syncing');

if (!fs.existsSync(global.uploadpath)) {
    // Create the directory if it does not exist
    fs.mkdirSync(global.uploadpath);
}

if (fs.existsSync(global.variantePretSyncing)) {
    fs.unlinkSync(global.variantePretSyncing);
}

global.templatepath = path.join(path.resolve(__dirname), '../templates');

const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

server.setTimeout(1000 * 60 * 10);
server.timeout = 1000 * 60 * 10;

process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
    logger.info('PPCEasy application started on http://%s:%d', app.get('host'), port)
);