const assert = require('assert');
const app = require('../../src/app');

describe('\'change-password\' service', () => {
  it('registered the service', () => {
    const service = app.service('change-password');

    assert.ok(service, 'Registered the service');
  });
});
