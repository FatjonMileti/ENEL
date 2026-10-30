const assert = require('assert');
const app = require('../../src/app');

describe('\'offer\' service', () => {
  it('registered the service', () => {
    const service = app.service('offer');

    assert.ok(service, 'Registered the service');
  });
});
