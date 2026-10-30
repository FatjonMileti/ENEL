const assert = require('assert');
const app = require('../../src/app');

describe('\'ocr\' service', () => {
  it('registered the service', () => {
    const service = app.service('ocr');

    assert.ok(service, 'Registered the service');
  });
});
