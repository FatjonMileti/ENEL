const assert = require('assert');
const app = require('../../src/app');

describe('\'banca\' service', () => {
  it('registered the service', () => {
    const service = app.service('banca');

    assert.ok(service, 'Registered the service');
  });
});
