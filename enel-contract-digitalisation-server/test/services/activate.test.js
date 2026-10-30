const assert = require('assert');
const app = require('../../src/app');

describe('\'activate\' service', () => {
  it('registered the service', () => {
    const service = app.service('activate');

    assert.ok(service, 'Registered the service');
  });
});
