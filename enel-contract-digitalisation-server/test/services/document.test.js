const assert = require('assert');
const app = require('../../src/app');

describe('\'document\' service', () => {
  it('registered the service', () => {
    const service = app.service('document');

    assert.ok(service, 'Registered the service');
  });
});
