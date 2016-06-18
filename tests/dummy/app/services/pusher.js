import Ember from 'ember';
import PusherBase from 'ember-pusher-guru/services/pusher-base';

export default PusherBase.extend({
  // auth endpoint for private channels
  authEndpoint: 'http://localhost:3000/auth',

  // some computed channels data that e.g. may be based on current user ID
  channelsData: Ember.computed(function() {
    const somethingDynamin = 'stringray';
    const firstChannel = {};

    firstChannel[somethingDynamin] = ['cover'];

    return [
      firstChannel,
      { eel: ['electroshock', 'swim'] },
      { 'private-coconut': ['fall'] }
    ];
  }),

  authDataParams: Ember.computed(function() {
    // some dynamic authorization data that may be based on e.g. current user token
    return { someData: '123' };
  }),

  init() {
    this._super(...arguments);
  }
});
