const assert = require('assert');
const app = require('../../src/app');

describe('\'cod-postal\' service', () => {
  it('registered the service', () => {
    const service = app.service('cod-postal');

    assert.ok(service, 'Registered the service');
  });
});
