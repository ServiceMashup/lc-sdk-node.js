var serviceSDK = require('../src/lc-http-client');
var expect     = require('chai').expect;

var DISCOVERY_SERVICE_URLS = [
  'http://46.101.175.234:8500'
];

describe('When we make a request to a service', function () {
  var result;

  before(function (done) {
    serviceSDK({ discoveryServers: DISCOVERY_SERVICE_URLS })
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
