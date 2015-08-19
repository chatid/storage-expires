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
    for (i = 0; i < keys.length; i++) localStorage.removeItem(keys[i]);
  }
};

describe("StorageExpires", function() {

  afterEach(function() {
    localStorage.clear();
  });

  it("expires keys according to options.expires", function(done) {

    var storage = StorageExpires(lsWrapper);
    storage.set('test', 'value', { expires: +new Date + 500 });
    expect(storage.get('test')).to.be('value');
    setTimeout(function() {
      expect(storage.get('test')).to.be('value');
      setTimeout(function() {
        expect(storage.get('test')).to.be('value');
        setTimeout(function() {
          expect(storage.get('test')).to.be(undefined);
          done();
        }, 480);
      }, 200);
    }, 20);

  });

  it("supports structured data.", function(done) {
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
    setTimeout(function() {
      expect(storage.get('test')).to.be(undefined);
      done();
    }, 200);
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

  it("never expires by default.", function(done) {

    var storage = StorageExpires(lsWrapper);
    storage.set('test', 'value');
    expect(storage.get('test')).to.be('value');
    setTimeout(function() {
      expect(storage.get('test')).to.be('value');
      setTimeout(function() {
        expect(storage.get('test')).to.be('value');
        setTimeout(function() {
          expect(storage.get('test')).to.be('value');
          done();
        }, 480);
      }, 200);
    }, 20);

  });

});
