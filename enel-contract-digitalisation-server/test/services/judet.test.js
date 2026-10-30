const assert = require('assert');
const app = require('../../src/app');

describe('\'judet\' service', () => {
  it('registered the service', () => {
    const service = app.service('judet');

    assert.ok(service, 'Registered the service');
  });
});
