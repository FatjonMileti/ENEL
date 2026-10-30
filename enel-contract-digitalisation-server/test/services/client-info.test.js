const assert = require('assert');
const app = require('../../src/app');

describe('\'clientInfo\' service', () => {
  it('registered the service', () => {
    const service = app.service('client-info');

    assert.ok(service, 'Registered the service');
  });
});
