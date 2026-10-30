const assert = require('assert');
const app = require('../../src/app');

describe('\'localitate\' service', () => {
  it('registered the service', () => {
    const service = app.service('localitate');

    assert.ok(service, 'Registered the service');
  });
});
