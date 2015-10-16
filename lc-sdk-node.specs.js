var serviceSDK = require('./lc-sdk-node');
var expect     = require('chai').expect;

var DISCOVERY_SERVICE_URLS = [
  'http://46.101.245.190:8500',
  'http://46.101.132.55:8500',
  'http://46.101.193.82:8500'
];

describe('When we make a request to a service', function () {
  var result;

  before(function (done) {
    serviceSDK({ discoveryServers: DISCOVERY_SERVICE_URLS })
      .get('welcome-service', '/healthcheck')
      .then(function (res) {
        result = res;
      })
      .then(done, done);
  });

  it('should respond with the expected data', function () {
    expect(result).eql({ message: 'OK' });
  });

});
