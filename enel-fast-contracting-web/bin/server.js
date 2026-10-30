const config = require('../config/server');
const server = require('../server');
const debug = require('debug')('app:bin:server');

/**
 * Listen on provided port, on all network interfaces.
 */

const port = config.server_port;
server.listen(port, () => (
    debug(`Server is now running at http://localhost:${port}.`)
));
