(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["storage-expires"] = factory();
	else
		root["storage-expires"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Storage Expires
	 *
	 * Key expiration for any storage interface (defaults to LocalStorage)
	*/

	var assign = __webpack_require__(1);

	var lsWrapper = {
	  get: function(key) {
	    return localStorage.getItem(key);
	  },
	  set: function(key, value, options) {
	    return localStorage.setItem(key, value);
	  },
	  unset: function(keys) {
	    if (!(keys instanceof Array)) keys = [keys];
	    for (i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
	  }
	};

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

	      expires = parseInt(data.substring(0, index), 10);
	      value = data.substring(index + 1);

	      // Check for NaN
	      if (expires != +expires) return fail();

	      try { value = JSON.parse(value); }
	      catch (e) { return fail(); }

	      return [expires, value];
	    },

	  });

	};


/***/ },
/* 1 */
/***/ function(module, exports) {

	var slice = [].slice;

	module.exports = function(obj) {
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


/***/ }
/******/ ])
});
;