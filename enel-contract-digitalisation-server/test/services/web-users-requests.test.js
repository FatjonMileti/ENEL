const assert = require('assert');
const app = require('../../src/app');

describe('\'web-users-requests\' service', () => {
  it('registered the service', () => {
    const service = app.service('web-users-requests');

    assert.ok(service, 'Registered the service');
  });
});
