import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | upload-files', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:upload-files');
    assert.ok(controller);
  });
});
