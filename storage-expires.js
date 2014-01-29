/*
 * Storage Expires
 *
 * Key expiration for any storage interface (defaults to LocalStorage)
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) define('storage-expires', factory);
  else root.StorageExpires = factory();
}(this, function() {

  // Wrap localStorage so it may be swapped out.
  var lsWrapper = {
    get: function(key) {
      return localStorage.getItem(key);
    },
    set: function(key, value) {
      return localStorage.setItem(key, value);
    },
    unset: function(keys) {
      if (!(keys instanceof Array)) keys = [keys];
      for (i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
    }
  };

  // StorageExpires
  // --------------

  // Wrap some storage interface with key-expiration by prepending a timestamp with all
  // writes. Also performs JSON stringification.
  var StorageExpires = function(storage) {
    this.storage = storage || lsWrapper;
  }

  StorageExpires.prototype = {

    // Prepend a timestamp to any value.
    serialize: function(value, options) {
      var e;
      options = options || {};
      value = ' ' + JSON.stringify(value);
      if (e = +options.expires) value = e + value;
      return value;
    },

    // Parse the timestamp and value, returning [undefined, undefined] if the value
    // does not comply with the protocol.
    deserialize: function(data) {
      var index, expires, value,
          fail = function() { return [undefined, undefined]; };

      if (!data) return fail();

      index = data.indexOf(' ');

      if (index === -1) return fail();

      expires = data.substring(0, index);
      value = data.substring(index + 1);

      try { value = JSON.parse(value); }
      catch (e) { return fail(); }

      return [expires, value];
    },

    // Fetch and serialize the value for a given key. Delete the key if it's expired or
    // does not comply with the protocol.
    get: function(key) {
      var self = this,
          value = this.storage.get(key) || '',
          fail = function(key) { self.unset(key); return undefined; },
          ref, expires;

      // Fail if `value` doesn't comply with expirable-key protocol.
      if (typeof value != 'string') return fail(key);

      ref = this.deserialize(value);
      expires = ref[0];
      value = ref[1];

      // `undefined` does not comply with protocol.
      if (expires == undefined) {
        return fail(key);
      // Empty string means no expiration.
      } else if (expires != '') {
        expires = parseInt(expires);
        // Check for NaN
        if (expires != +expires) return fail(key);
        if (new Date(expires) < new Date) return fail(key);
      }

      return value;
    },

    set: function(key, value, options) {
      value = this.serialize(value, options);
      return this.storage.set(key, value);
    },

    unset: function(key) {
      return this.storage.unset(key);
    }
  }

  return StorageExpires;

}));
