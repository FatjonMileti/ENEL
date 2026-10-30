const assert = require('assert');
const app = require('../../src/app');

describe('\'session\' service', () => {
  it('registered the service', () => {
    const service = app.service('session');

    assert.ok(service, 'Registered the service');
  });
});
