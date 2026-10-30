const assert = require('assert');
const app = require('../../src/app');

describe('\'canal\' service', () => {
  it('registered the service', () => {
    const service = app.service('canal');

    assert.ok(service, 'Registered the service');
  });
});
