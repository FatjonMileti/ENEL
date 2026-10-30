const assert = require('assert');
const app = require('../../src/app');

describe('\'sign\' service', () => {
  it('registered the service', () => {
    const service = app.service('sign');

    assert.ok(service, 'Registered the service');
  });
});
