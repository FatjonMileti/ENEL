const assert = require('assert');
const app = require('../../src/app');

describe('\'gama-serviciu\' service', () => {
  it('registered the service', () => {
    const service = app.service('gama-serviciu');

    assert.ok(service, 'Registered the service');
  });
});
