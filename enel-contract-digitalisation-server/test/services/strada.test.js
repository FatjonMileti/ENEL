const assert = require('assert');
const app = require('../../src/app');

describe('\'strada\' service', () => {
  it('registered the service', () => {
    const service = app.service('strada');

    assert.ok(service, 'Registered the service');
  });
});
