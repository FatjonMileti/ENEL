const assert = require('assert');
const app = require('../../src/app');

describe('\'checkSmsCode\' service', () => {
  it('registered the service', () => {
    const service = app.service('check-client-code');

    assert.ok(service, 'Registered the service');
  });
});
