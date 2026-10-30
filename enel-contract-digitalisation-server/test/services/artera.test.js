const assert = require('assert');
const app = require('../../src/app');

describe('\'artera\' service', () => {
  it('registered the service', () => {
    const service = app.service('artera');

    assert.ok(service, 'Registered the service');
  });
});
