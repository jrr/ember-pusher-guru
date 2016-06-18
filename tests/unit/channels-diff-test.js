import { channelsDiff, removeChannel } from 'ember-pusher-guru/utils/channels-diff';
import { module, test } from 'qunit';

module('Unit | Utility | channelsDiff');

test('it properly replaces channels', function(assert) {
  const oldChannelsData = [{ test_channel: ['test_event'] }];
  const newChannelsData = [{ new_channel: ['new_event'] }];
  const diff = channelsDiff(oldChannelsData, newChannelsData);
  assert.deepEqual(diff.channelsToSubscribe, newChannelsData);
  assert.deepEqual(diff.channelsToUnsubscribe, oldChannelsData);
});

test('it properly replaces channels when some of them repeat', function(assert) {
  const oldChannelsData = [{ test_channel: ['test_event'] }];
  const newChannelsData = [ ...oldChannelsData, { new_channel: ['new_event'] }];
  const diff = channelsDiff(oldChannelsData, newChannelsData);
  assert.deepEqual(diff.channelsToUnsubscribe, []);
  assert.deepEqual(diff.channelsToSubscribe, [{ new_channel: ['new_event'] }]);
});

test('it properly diffs when newChannelsData same as old', function(assert) {
  const oldChannelsData = [{ test_channel: ['test_event'] }];
  const newChannelsData = [ ...oldChannelsData ];
  const diff = channelsDiff(oldChannelsData, newChannelsData);
  assert.deepEqual(diff.channelsToUnsubscribe, []);
  assert.deepEqual(diff.channelsToSubscribe, []);
});

test('it properly diffs mixed', function(assert){
  const oldChannelsData = [{ test_channel: ['test_event'] }];
  const newChannelsData = [
    { foo_channel: ['foo_event'] },
    { new_channel: ['new_event', 'new_event2']}
  ];

  const diff = channelsDiff(oldChannelsData, newChannelsData);
  assert.deepEqual(diff.channelsToUnsubscribe, [{ test_channel: ['test_event'] }]);
  assert.deepEqual(
    diff.channelsToSubscribe,
    [{ foo_channel: ['foo_event'] }, { new_channel: ['new_event', 'new_event2'] }]
  );
});

test('it properly removes channel', function(assert) {
  const channelsData = [
    { test_channel: ['test_event'] },
    { my_channel: ['my_event'] }
  ];

  const newChannelsData = removeChannel(channelsData, 'my_channel');

  assert.deepEqual(newChannelsData, [{ test_channel: ['test_event'] }]);
});
