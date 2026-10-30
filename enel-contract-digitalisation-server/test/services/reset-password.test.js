const assert = require('assert');
const app = require('../../src/app');

describe('\'reset-password\' service', () => {
  it('registered the service', () => {
    const service = app.service('reset-password');

    assert.ok(service, 'Registered the service');
  });
});
