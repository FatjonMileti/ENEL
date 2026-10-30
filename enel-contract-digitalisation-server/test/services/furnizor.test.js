const assert = require('assert');
const app = require('../../src/app');

describe('\'furnizor\' service', () => {
  it('registered the service', () => {
    const service = app.service('furnizor');

    assert.ok(service, 'Registered the service');
  });
});
