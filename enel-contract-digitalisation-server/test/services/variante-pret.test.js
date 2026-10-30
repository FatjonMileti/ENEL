const assert = require('assert');
const app = require('../../src/app');

describe('\'variante-pret\' service', () => {
  it('registered the service', () => {
    const service = app.service('variante-pret');

    assert.ok(service, 'Registered the service');
  });
});
