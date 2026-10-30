require('dotenv').config();

const assert = require('assert');
const app = require('../../src/app');

// const expect = require('chai').expect;
// const logger = require('../../src/utils/logger');


describe('\'client-offers\' service', () => {
  it('registered the service', () => {
    const service = app.service('client-offers');

    assert.ok(service, 'Registered the service');
  });

  it('should filter offers for judet, EE and GAZ', async () => {
    const service = app.service('client-offers');
    service.setup(app);

    assert.ok(service, 'Registered the service');
  });
});
