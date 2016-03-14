var http       = require('../lib/lc-http-client');
var expect     = require('chai').expect;

var DISCOVERY_SERVICE_URLS = [
  'http://46.101.175.234:8500'
];

describe('When we make a request to a service', function () {
  var result;

  before(function (done) {
    http({ discoveryServers: DISCOVERY_SERVICE_URLS })
      .get('subkitmikebild', '/healthcheck')
      .then(function (res) {
        result = res;
      })
      .then(done, done);
  });

  it('should respond with the expected data', function () {
    expect(result.version).eql('2.6.11');
  });

});

describe('When we need the address of a tag name', function () {
  var result;

  before(function (done) {
    http({ discoveryServers: DISCOVERY_SERVICE_URLS })
      .getServiceUrlsByTag('subkitmikebild')
      .then(function (res) {
        result = res;
      })
      .then(done, done);
  });

  it('should respond with the expected data', function () {
    expect(result).eql({ subkitmikebild: [ '46.101.210.183:32770' ] });
  });

});

describe('When we need the address of a service name', function () {
  var result;

  before(function (done) {
    http({ discoveryServers: DISCOVERY_SERVICE_URLS })
      .getServiceUrls('subkitmikebild')
      .then(function (res) {
        result = res;
      })
      .then(done, done);
  });

  it('should respond with the expected data', function () {
    expect(result).eql([ '46.101.210.183:32770' ]);
  });

});

