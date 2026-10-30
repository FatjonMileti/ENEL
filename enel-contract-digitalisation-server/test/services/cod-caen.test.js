const assert = require('assert');
const app = require('../../src/app');

describe('\'cod-caen\' service', () => {
  it('registered the service', () => {
    const service = app.service('cod-caen');

    assert.ok(service, 'Registered the service');
  });
});
