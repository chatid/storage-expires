var expect = require('expect.js');
var StorageExpires = require('../storage-expires');

var lsWrapper = {
  get: function(key) {
    return localStorage.getItem(key);
  },
  set: function(key, value, options) {
    return localStorage.setItem(key, value);
  },
  unset: function(keys) {
    if (!(keys instanceof Array)) keys = [keys];
    for (var i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
  }
};

describe("StorageExpires", function() {

  var clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
  })

  afterEach(function() {
    localStorage.clear();
    clock.restore();
  });

  it("expires keys according to options.expires", function() {
    var storage = StorageExpires(lsWrapper);
    storage.set('test', 'value', { expires: +new Date + 500 });
    expect(storage.get('test')).to.be('value');
    clock.tick(20);
    expect(storage.get('test')).to.be('value');
    clock.tick(200);
    expect(storage.get('test')).to.be('value');
    clock.tick(480);
    expect(storage.get('test')).to.be(undefined);
  });

  it("supports structured data.", function() {
    var storage = StorageExpires(lsWrapper);
    storage.set('test', {
      string: 'test',
      number: 234,
      array: ['foo', 'bar', 89]
    }, { expires: +new Date + 100 });
    var test = storage.get('test');
    expect(test).to.be.an('object');
    expect(test.string).to.be.a('string');
    expect(test.number).to.be.a('number');
    expect(test.array).to.be.an(Array);
    expect(test.array).to.have.length(3);
    expect(test.array[0]).to.be('foo');
    expect(test.array[1]).to.be('bar');
    expect(test.array[2]).to.be(89);
    clock.tick(200);
    expect(storage.get('test')).to.be(undefined);
  });

  it("exposes #decode.", function() {
    var storage = StorageExpires(lsWrapper);
    var future = +new Date + 500;
    storage.set('test', 'value', { expires: future });
    var ref = storage.decode(localStorage.test);
    var expires = ref[0];
    var value = ref[1];
    expect(expires).to.be(future);
    expect(expires).to.be.greaterThan(+new Date);
    expect(value).to.be('value');
  });

  it("never expires by default.", function() {
    var storage = StorageExpires(lsWrapper);
    storage.set('test', 'value');
    expect(storage.get('test')).to.be('value');
    clock.tick(20);
    expect(storage.get('test')).to.be('value');
    clock.tick(200);
    expect(storage.get('test')).to.be('value');
    clock.tick(480);
    expect(storage.get('test')).to.be('value');

    localStorage.setItem('foo', '-1 "bar"');
    expect(storage.get('foo')).to.be('bar');
  });

  it("is graceful when coming across malformed data: not a string", function() {
    var storage = StorageExpires(lsWrapper);
    localStorage.setItem('foo', 100);
    var getter = function() {
      return storage.get('foo');
    };
    expect(getter).to.not.throwException();
    expect(getter()).to.be(undefined);
  });

  it("is graceful when coming across malformed data: no space", function() {
    var storage = StorageExpires(lsWrapper);
    localStorage.setItem('foo', 'bar');
    var getter = function() {
      return storage.get('foo');
    };
    expect(getter).to.not.throwException();
    expect(getter()).to.be(undefined);
  });

  it("is graceful when coming across malformed data: bad/no timestamp", function() {
    var storage = StorageExpires(lsWrapper);
    var getter = function() {
      return storage.get('foo');
    };

    localStorage.setItem('foo', 'foo bar');
    expect(getter).to.not.throwException();
    expect(getter()).to.be(undefined);

    localStorage.setItem('foo', ' bar');
    expect(getter).to.not.throwException();
    expect(getter()).to.be(undefined);
  });

  it("is graceful when coming across malformed data: bad JSON", function() {
    var storage = StorageExpires(lsWrapper);
    var getter = function() {
      return storage.get('foo');
    };
    localStorage.setItem('foo', +new Date + 10000 + ' {"good":"json"}');
    expect(getter()).to.eql({ good: 'json' });
    localStorage.setItem('foo', +new Date + 10000 + ' {"bad":json"}');
    expect(getter).to.not.throwException();
    expect(getter()).to.be(undefined);
  });

  it("wraps any storage interface", function() {
    var myStorage = {
      _store: {},
      get: function(key) {
        return this._store[key];
      },
      set: function(key, value, options) {
        return this._store[key] = value;
      },
      unset: function(keys) {
        if (!(keys instanceof Array)) keys = [keys];
        for (var i = 0; i < keys.length; i++) this._store[keys[i]] = null;
      }
    }
    var storage = StorageExpires(myStorage);

    storage.set('foo', 'bar');
    expect(storage.get('foo')).to.be('bar');

    storage.set('foo', 'bar', { expires: +new Date + 500 });
    clock.tick(600);
    expect(storage.get('foo')).to.be(undefined);

    storage.set('foo', 'bar');
    var ref = storage.decode(myStorage._store.foo);
    expect(ref[0]).to.be(-1);
    expect(ref[1]).to.be('bar');
  });

});
