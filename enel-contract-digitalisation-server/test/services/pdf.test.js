const assert = require('assert');
const app = require('../../src/app');

describe('\'pdf-dir\' service', () => {
  it('registered the service', () => {
    const service = app.service('pdf');

    assert.ok(service, 'Registered the service');
  });
});
