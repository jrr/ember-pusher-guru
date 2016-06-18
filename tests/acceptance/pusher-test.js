/*global Pusher:true*/
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | pusher');

function triggerEvent(event, message, channelName = 'stringray') {
  const channel = Pusher.instances[0].channel(channelName);
  channel.emit(event, { message: message });
}

test('handles event that is listening for', function(assert) {
  visit('/');
  andThen(() => {
    assert.equal(currentURL(), '/');
    triggerEvent('cover', 'stone');
    assert.equal(find('#message').text(), 'stone');
    triggerEvent('new_event', 'New event', 'new_channel');
    assert.equal(
      find('#message').text(),
      'New event',
      'it handles dynamically added events'
    );
  });
});

