const assert = require('assert');
const app = require('../../src/app');

describe('\'clients-api\' service', () => {
  it('registered the service', () => {
    const service = app.service('clients-api');

    assert.ok(service, 'Registered the service');
  });
});
