import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

var pusherService;

var exampleConfig = {
  encrypted: false,
  cluster: 'eu',
  disableStats: true,
  authEndpoint: 'some endpoint',
};

function resetDummyData(service) {
  service.authEndpoint = null;
  service.authDataParams = null;
}

function setupDummyData(service) {
  service.pusherConfig = exampleConfig;
}

function stubUnsubscribe(pusherInstance) {
  pusherInstance.unsubscribe = function(channel) {
    delete this._channels[channel];
  };
}

moduleForAcceptance('Unit | Services | PusherBase', {
  beforeEach() {
    pusherService = this.application.__container__.lookup('service:pusher');
    // we need this since the 1.0.0 version of pusher-test-stub
    // throws "not implemented" - it can be removed once the pusher-test-stub
    // is upgraded
    stubUnsubscribe(pusherService.get('pusher'));
  },
});

test('properly fills Pusher options with empty config object', function(assert) {
  resetDummyData(pusherService);
  const results = pusherService._findOptions();
  assert.deepEqual(results, { encrypted: true }, 'encrypted set to true by default');
});

test('properly fills Pusher options when authEndpoint is specified depreciated way', function(assert) {
  const results = pusherService._findOptions();
  const expectedResult = {
    auth: {
      params: {
        someData: "123"
      }
    },
    authEndpoint: "http://localhost:3000/auth",
    authTransport: "jsonp",
    encrypted: true
  };

  assert.deepEqual(results, expectedResult, 'full auth hash and auth properties are filled in');
});

test('properly fills Pusher options when authEndpoint is specified depreciated way', function(assert) {
  resetDummyData(pusherService);
  setupDummyData(pusherService);
  const results = pusherService._findOptions();
  const expectedResult = exampleConfig;
  assert.deepEqual(results, expectedResult, 'full auth hash and auth properties are filled in');
});

test('properly fills Pusher channels with data from channelsData', function(assert){
  pusherService.set('channelsData', [
    { test_channel: ['test_event']}
  ]);
  pusherService.setup();
  const registeredChannels = Object.keys(pusherService.pusher._channels);
  assert.deepEqual(registeredChannels, ['test_channel'], 'it registers the channel');
});

test('properly adds channels when channelsData changed', function(assert) {
  const channelsData = [
    { test_channel: ['test_event']}
  ];
  pusherService.set('channelsData', channelsData);
  pusherService.setup();
  pusherService.updateChannelsData([
    ...channelsData, { new_channel: ['new_event'] }
  ]);
  const registeredChannels = Object.keys(pusherService.pusher._channels);
  assert.deepEqual(registeredChannels, ['test_channel', 'new_channel']);
});

test('it changes the channels list instead of only adding to it', function(assert) {
  setupDummyData(pusherService);
  const channelsData = [
    { test_channel: ['test_event']}
  ];
  pusherService.set('channelsData', channelsData);
  pusherService.setup();
  stubUnsubscribe(pusherService.get('pusher'));
  pusherService.updateChannelsData([
    { new_channel: ['new_event'] }
  ]);
  const registeredChannels = Object.keys(pusherService.pusher._channels);
  assert.deepEqual(registeredChannels, ['new_channel']);
});

test('it removes and unsubscribes from channels when removeChannel called', function(assert) {
  setupDummyData(pusherService);
  const channelsData = [
    { my_channel: ['test_data'] },
    { test_channel: ['test_event'] }
  ];
  pusherService.set('channelsData', channelsData);
  pusherService.setup();
  stubUnsubscribe(pusherService.get('pusher'));
  pusherService.removeChannel('my_channel');
  const registeredChannels = Object.keys(pusherService.pusher._channels);
  assert.deepEqual(registeredChannels, ['test_channel']);
});

test(
  'it adds and subscribes to channels with addChannelsData (object form)',
  function(assert) {
    setupDummyData(pusherService);
    const channelsData = [
      { test_channel: ['test_event'] }
    ];
    pusherService.set('channelsData', channelsData);
    pusherService.setup();
    stubUnsubscribe(pusherService.get('pusher'));
    pusherService.addChannelsData({ my_channel: ['test_data'] });
    const registeredChannels = Object.keys(pusherService.pusher._channels);
    assert.deepEqual(registeredChannels, ['test_channel', 'my_channel']);
  }
);

test(
  'it adds and subscribes to channels with addChannelsData (array form)',
  function(assert) {
    setupDummyData(pusherService);
    const channelsData = [
      { test_channel: ['test_event'] }
    ];
    pusherService.set('channelsData', channelsData);
    pusherService.setup();
    stubUnsubscribe(pusherService.get('pusher'));
    pusherService.addChannelsData([{ my_channel: ['test_data'] }]);
    const registeredChannels = Object.keys(pusherService.pusher._channels);
    assert.deepEqual(registeredChannels, ['test_channel', 'my_channel']);
  }
 );
