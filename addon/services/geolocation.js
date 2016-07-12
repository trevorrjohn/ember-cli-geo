import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  currentLocation: null,
  permissionState: 'unknown',

  getLocation(geoOptions) {

    return new Ember.RSVP.Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((geoObject) => {
        this.trigger('geolocationSuccess', geoObject, resolve);
      }, (reason) => {
        this.trigger('geolocationFail', reason, reject);
      }, geoOptions);
    });

  },

  trackLocation(geoOptions) {

    return new Ember.RSVP.Promise((resolve, reject) => {
      navigator.geolocation.watchPosition((geoObject) => {
        this.trigger('geolocationSuccess', geoObject, resolve);
      }, (reason) => {
        this.trigger('geolocationFail', reason, reject);
      }, geoOptions);
    });

  },

  geolocationDidSucceed: Ember.on('geolocationSuccess', function(geoObject, resolve) {
    this.set('currentLocation', [geoObject.coords.latitude, geoObject.coords.longitude]);
    resolve(geoObject);
  }),

  geolocationDidFail: Ember.on('geolocationFail', function(reason, reject) {
    reject(reason);
  }),

  hasPermission() {
    return navigator.permissions.query({ name: 'geolocation' })
    .then(permissionState => {
      this._updatePermissionState(permissionState);
      permissionState.onChange = this._updatePermissionState.bind(this, permissionState);

      return permissionState.state === 'granted';
    });
  },

  _updatePermissionState(permissionState) {
    this.set('permissionState', permissionState.state);
  }
});
