var q       = require('q');
var extend  = require('extend');
var request = require('superagent');

require('q-superagent')(request);

var DEFAULT_CONFIG = {
  discoveryServers: [],
  services: {},
  timeout: 1000
};

module.exports = function (cfg) {
  var config = extend({}, DEFAULT_CONFIG, cfg);

  return {
    get: get,
    post: post,
    put: put,
    delete: del
  };

  function get(serviceName, path) {
    return ajax('get', serviceName, path);
  }

  function post(serviceName, path, value) {
    return ajax('post', serviceName, path, value);
  }

  function put(serviceName, path, value) {
    return ajax('put', serviceName, path, value);
  }

  function del(serviceName, path) {
    return ajax('delete', serviceName, path, value);
  }

  function ajax(method, serviceName, path, value) {
    return getServiceUrls(serviceName).then(function (urls) {
      if (!urls.length) throw new Error('No endpoint configured for service ' + serviceName);

      // Map url to a list of operations
      var funcs = urls.map(function (url) {
        return function () {
          return request(method, 'http://' + url + path)
            .set('Connection', 'keep-alive')
            .send(value)
            .type('json')
            .accept('json')
            .timeout(config.timeout)
            .q();
        };
      });

      return invokeUntilResolved(funcs);
    });
  }

  function getServiceUrls(serviceName) {
    if (config.services[serviceName]) return q.when(config.services[serviceName]);

    var funcs = config.discoveryServers.map(function (discoveryServer) {
      return function () {
        return request
          .get(discoveryServer + '/v1/catalog/service/' + serviceName)
          .timeout(config.timeout)
          .q();
      };
    });

    return invokeUntilResolved(funcs).then(function (result) {
      var serviceUrls = result.body.map(function (itm) {
        return itm.Address + ':' + itm.ServicePort;
      });

      config.services[serviceName] = serviceUrls;
      return serviceUrls;
    });
  }

  function invokeUntilResolved(funcs) {
    // Invoke functions that return promises sequentially
    // and return the first resolved promise.
    // Invoke the next function only when the return value
    // of the previous function is a rejected promise.
    return funcs.reduce(function (previous, next) {
      return previous.catch(next);
    }, q.reject(new Error('No function specified')));
  }

};
