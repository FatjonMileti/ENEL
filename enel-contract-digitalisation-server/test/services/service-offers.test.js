const assert = require('assert');
const app = require('../../src/app');

describe('\'service-offers\' service', () => {
  it('registered the service', () => {
    const service = app.service('service-offers');

    assert.ok(service, 'Registered the service');
  });
});
