/*
 * Storage Expires
 *
 * Key expiration for any storage interface (defaults to LocalStorage)
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) define('storage-expires', factory);
  else if (typeof exports === 'object') module.exports = factory();
  else root.StorageExpires = factory();
}(this, function() {

  var slice = [].slice;

  // ref `_.extend`
  var extend = function(obj) {
    var args = slice.call(arguments, 1),
        props;
    for (var i = 0; i < args.length; i++) {
      if (props = args[i]) {
        for (var prop in props) {
          obj[prop] = props[prop];
        }
      }
    }
    return obj;
  };

  // StorageExpires
  // --------------

  // Decorate storage interface with key-expiration by prepending a timestamp to writes.
  var StorageExpires = function(storage) {

    return extend({}, storage, {

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
        if (expires == undefined) {
          return fail(key);
        // Empty string means no expiration.
        } else if (expires != -1) {
          if (new Date(expires) < new Date) return fail(key);
        }

        return value;
      },

      set: function(key, value, options) {
        return storage.set(key, this.encode(value, options));
      },

      serialize: function(value, options) {
        return value;
      },

      deserialize: function(data) {
        return data;
      },

      // Prepend a timestamp to any value.
      encode: function(value, options) {
        var e;
        options = options || {};
        value = (+options.expires || -1) + ' ' + JSON.stringify(value);
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

        expires = parseInt(data.substring(0, index));
        value = data.substring(index + 1);

        // Check for NaN
        if (expires != +expires) return fail();

        try { value = JSON.parse(value); }
        catch (e) { return fail(); }

        return [expires, value];
      },

    });

  };

  return StorageExpires;

}));
