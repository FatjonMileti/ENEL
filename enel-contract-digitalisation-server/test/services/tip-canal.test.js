const assert = require('assert');
const app = require('../../src/app');

describe('\'tip-canal\' service', () => {
  it('registered the service', () => {
    const service = app.service('tip-canal');

    assert.ok(service, 'Registered the service');
  });
});
