/*
 * Storage Expires
 *
 * Key expiration for any storage interface (defaults to LocalStorage)
*/

var assign = require('./util/assign');
var lsWrapper = require('./util/ls-wrapper');

// StorageExpires
// --------------

// Decorate storage interface with key-expiration by prepending a timestamp to writes.
module.exports = function(storage) {

  if (typeof storage === 'undefined') {
    storage = lsWrapper;
  }

  return assign({}, storage, {

    // Fetch and serialize the value for a given key. Delete the key if it's expired or
    // does not comply with the protocol.
    get: function(key) {
      var storageExpires = this,
          value = storage.get.apply(this, arguments) || '',
          fail = function(key) { storageExpires.unset(key); },
          ref, expires;

      // Fail if `value` doesn't comply with expirable-key protocol.
      if (typeof value != 'string') return fail(key);

      ref = this.decode(value);
      expires = ref[0];
      value = ref[1];

      // `undefined` does not comply with protocol.
      if (typeof expires === 'undefined') {
        return fail(key);
      // -1 means no expiration.
      } else if (expires != -1) {
        if (new Date(expires) < new Date) return fail(key);
      }

      return value;
    },

    set: function(key, value, options) {
      return storage.set(key, this.encode(value, options));
    },

    serialize: function(value) {
      return JSON.stringify(value);
    },

    deserialize: function(data) {
      return JSON.parse(data);
    },

    // Prepend a timestamp to any value.
    encode: function(value, options) {
      var e;
      options = options || {};
      value = (+options.expires || -1) + ' ' + this.serialize(value);
      return value;
    },

    // Parse the timestamp and value, returning [undefined, undefined] if the value
    // does not comply with the protocol.
    decode: function(data) {
      var index, expires, value,
          fail = function() { return [undefined, undefined]; };

      if (!data) return fail();

      index = data.indexOf(' ');

      if (index === -1) return fail();

      expires = parseInt(data.substring(0, index), 10);
      data = data.substring(index + 1);

      // Check for NaN
      if (expires != +expires) return fail();

      try { value = this.deserialize(data); }
      catch (e) { return fail(); }

      return [expires, value];
    },

  });

};
