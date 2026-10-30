const assert = require('assert');
const app = require('../../src/app');

describe('\'merge-documents\' service', () => {
  it('registered the service', () => {
    const service = app.service('merge-documents');

    assert.ok(service, 'Registered the service');
  });
});
