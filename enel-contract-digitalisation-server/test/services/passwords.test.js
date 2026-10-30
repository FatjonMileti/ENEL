const assert = require('assert');
const app = require('../../src/app');

describe('\'passwords\' service', () => {
  it('registered the service', () => {
    const service = app.service('passwords');

    assert.ok(service, 'Registered the service');
  });
});
