const assert = require('assert');
const app = require('../../src/app');
const logger = require('winston');

describe('\'importData\' service', () => {
  it('registered the service', () => {
    const service = app.service('import-data');
    logger.info('Register service test');
    assert.ok(service, 'Registered the service');
  });
});
