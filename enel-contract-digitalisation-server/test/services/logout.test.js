const assert = require('assert');
const app = require('../../src/app');

describe('\'logout\' service', () => {
  it('registered the service', () => {
    const service = app.service('logout');

    assert.ok(service, 'Registered the service');
  });
});
