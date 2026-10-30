const assert = require('assert');
const app = require('../../src/app');

describe('\'excel\' service', () => {
  it('registered the service', () => {
    const service = app.service('excel');

    assert.ok(service, 'Registered the service');
  });
});
