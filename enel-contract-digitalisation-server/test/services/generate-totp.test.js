const assert = require('assert');
const app = require('../../src/app');

describe('\'generate-totp\' service', () => {
  it('registered the service', () => {
    const service = app.service('generateTOTP');

    assert.ok(service, 'Registered the service');
  });
});
