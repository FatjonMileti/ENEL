const assert = require('assert');
const app = require('../../src/app');

describe('\'judete_zd\' service', () => {
  it('registered the service', () => {
    const service = app.service('judete-zd');

    assert.ok(service, 'Registered the service');
  });
});
