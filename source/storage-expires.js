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
          data = storage.get.apply(this, arguments) || '',
          fail = function() { storageExpires.unset(key); },
          ref, expires, value;

      // Fail if `value` doesn't comply with expirable-key protocol.
      if (typeof data != 'string') return fail();

      ref = this.decode(data);
      expires = ref[0];

      try { value = this.deserialize(ref[1]); }
      catch (e) { return fail(); }

      // `undefined` does not comply with protocol.
      if (typeof expires === 'undefined') {
        return fail();
      // -1 means no expiration.
      } else if (expires != -1) {
        if (new Date(expires) < new Date) return fail();
      }

      return value;
    },

    set: function(key, value, options) {
      return storage.set(key, this.encode(this.serialize(value), options));
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
      value = (+options.expires || -1) + ' ' + value;
      return value;
    },

    // Parse the timestamp and value, returning [undefined, undefined] if the value
    // does not comply with the protocol.
    decode: function(data) {
      var index, expires,
          fail = function() { return [undefined, undefined]; };

      if (!data) return fail();

      index = data.indexOf(' ');

      if (index === -1) return fail();

      expires = parseInt(data.substring(0, index), 10);
      data = data.substring(index + 1);

      // Check for NaN
      if (expires != +expires) return fail();

      return [expires, data];
    }

  });

};
