const assert = require('assert');
const app = require('../../src/app');

describe('\'info-nlc\' service', () => {
  it('registered the service', () => {
    const service = app.service('info-nlc');

    assert.ok(service, 'Registered the service');
  });
});
