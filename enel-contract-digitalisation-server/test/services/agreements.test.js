const assert = require('assert');
const app = require('../../src/app');

describe('\'agreements\' service', () => {
  it('registered the service', () => {
    const service = app.service('agreements');

    assert.ok(service, 'Registered the service');
  });
});
