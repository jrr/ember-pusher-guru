/*global Pusher:true*/
import Ember from 'ember';
import PusherInitializer from 'ember-pusher-guru/mixins/pusher-initializer';

const { Route, inject: { service } } = Ember;

export default Route.extend(PusherInitializer, {
  pusher: service(),
  message: null,
  pusherActions: [
    { swim: 'handleSwim' },
    { cover: 'handleCover' },
    { electroshock: 'handleElectroshock' },
    { new_event: 'handleNewEvent' }
  ],

  init() {
    this._super(...arguments);
    this.get('pusher').addChannelsData(
      { new_channel: ['new_event'] }
    );
  },

  handleCover(data) {
    Ember.$('#message').text(data.message);
  },
  handleElectroshock(data) {
    Ember.$('#message').text(data.message);
  },
  handleSwim(data) {
    Ember.$('#message').text(data.message);
  },
  handleNewEvent(data) {
    Ember.$('#message').text(data.message);
  },

  actions: {
    triggerEvent(channel, eventName, message) {
      Pusher.singleton.trigger(channel, eventName, { message: message });
    }
  }
});
