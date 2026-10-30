const assert = require('assert');
const app = require('../../src/app');

describe('\'tip-serviciu\' service', () => {
  it('registered the service', () => {
    const service = app.service('tip-serviciu');

    assert.ok(service, 'Registered the service');
  });
});
