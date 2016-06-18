import Ember from 'ember';
import Checker from 'ember-pusher-guru/mixins/checker';
import { fetchEvents } from 'ember-pusher-guru/utils/extract-events';
import { channelsDiff, removeChannel } from 'ember-pusher-guru/utils/channels-diff';
import getOwner from 'ember-getowner-polyfill';

const { get, computed, run, Logger, Service, isArray } = Ember;
const { bind } = run;
const { error } = Logger;

export default Service.extend(Ember.Evented, Checker, {
  pusher: null,
  pusherKey: null,

  pusherConfig: {
    authEndpoint: null,
    authDataParams: null,
    authDataHeaders: null,
    encrypted: true,
    cluster: null,
    disableStats: null,
    enabledTransports: null,
    disabledTransports: null,
    ignoreNullOrigin: null,
    activityTimeout: null,
    pongTimeout: null,
  },

  init() {
    this._super(...arguments);
    this.set('pusherKey', getOwner(this).resolveRegistration('config:environment').pusherKey);
    this.setup();
  },

  willDestroy() {
    if (get(this, 'pusher.disconnect')) {
      this.get('pusher').disconnect();
    }
  },

  setup() {
    this.checkEnv();
    this.set('pusher', new Pusher(this.get('pusherKey'), this._findOptions()));
    this._subscribeChannels(this.get('channelsData'));
    this.get('pusher').connection.bind('connected', (err, res) => {
      return this._connected();
    });
  },

  updateChannelsData(newChannelsData) {
    this._checkDataStructure(newChannelsData);
    this._manageChannelsChange(this.get('channelsData'), newChannelsData);
  },

  removeChannel(channelName) {
    this._manageChannelsChange(
      this.get('channelsData'),
      removeChannel(this.get('channelsData'), channelName)
    );
  },

  addChannelsData(newChannelsData) {
    const channelData = this.get('channelsData');
    this._checkDataStructure(newChannelsData);
    const updatedChannelsData = isArray(newChannelsData) ?
      [...channelData, ...newChannelsData] :
      [...channelData, newChannelsData];
    this._manageChannelsChange(channelData, updatedChannelsData);
  },

  _findOptions() {
    const options = {};
    Object.keys(this.get('pusherConfig')).forEach((key) => {
      if (get(this, `pusherConfig.${key}`) !== null) {
        options[key] = get(this, `pusherConfig.${key}`);
      }
    });
    const endpoint = this.get('authEndpoint');
    if(endpoint) {
      options.authEndpoint = endpoint;
      options.authTransport = 'jsonp';
      options.encrypted = true;
      options.auth = { params: this.get('authDataParams') };
      Ember.deprecate(
        'ember-pusher-guru: using `authEndpoint` outside `pusherConfig` is depreciated',
        true,
        { id: 'ember-pusher-guru-authEndpoint', until: new Date(2016, 12, 31) }
      );
    }
   return options;
  },

  _manageChannelsChange(oldChannelsData, newChannelsData) {
    const {
      channelsToSubscribe,
      channelsToUnsubscribe
    } = channelsDiff(oldChannelsData, newChannelsData);
    this._subscribeChannels(channelsToSubscribe);
    this._unsubscribeChannels(channelsToUnsubscribe);
  },

  _subscribeChannels(channelsData) {
    channelsData.forEach((singleChannel) => {
      const channelName = Object.keys(singleChannel)[0];
      const channel = this._addChannel(channelName);
      this._attachEventsToChannel(channel, channelName, channelsData);
    });
  },

  _unsubscribeChannels(channelsData) {
    const channels = channelsData.map(channel => Object.keys(channel)[0]);
    channels.forEach((channel) => {
      return this.get('pusher').unsubscribe(channel);
    });
  },

  _addChannel(name) {
    return this.get('pusher').subscribe(name);
  },

  _attachEventsToChannel(channel, channelName, data) {
    const events = fetchEvents(data, channelName);
    events.forEach((event) => {
      this._setEvent(channel, event);
    });
  },

  _setEvent(channel, event) {
    channel.bind(event, (data) => {
      run(() => {
        this.trigger('newEvent', event, data);
      });
    });
  },

  _connected() {
    this.set('socketId', this.get('pusher').connection.socket_id);
    return this._addSocketIdToXHR();
  },

  _addSocketIdToXHR() {
    Ember.$.ajaxPrefilter((options, originalOptions, xhr) => {
      return xhr.setRequestHeader('X-Pusher-Socket', this.socketId);
    });
  },
});
