const assert = require('assert');
const app = require('../../src/app');

describe('\'send-documents\' service', () => {
  it('registered the service', () => {
    const service = app.service('send-documents');

    assert.ok(service, 'Registered the service');
  });
});
