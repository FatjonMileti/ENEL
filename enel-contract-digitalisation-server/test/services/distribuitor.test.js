const assert = require('assert');
const app = require('../../src/app');

describe('\'distribuitor\' service', () => {
  it('registered the service', () => {
    const service = app.service('distribuitor');

    assert.ok(service, 'Registered the service');
  });
});
