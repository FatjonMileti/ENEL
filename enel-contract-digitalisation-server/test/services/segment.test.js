const assert = require('assert');
const app = require('../../src/app');

describe('\'segment\' service', () => {
  it('registered the service', () => {
    const service = app.service('segment');

    assert.ok(service, 'Registered the service');
  });
});
