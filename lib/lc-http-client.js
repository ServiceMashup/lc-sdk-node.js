var extend  = require('extend');
var fetch   = require('node-fetch');

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
    delete: del,
    getServices: getServices,
    getServiceUrlsByTag: getServiceUrlsByTag,
    getServiceUrls: getServiceUrls
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
          return fetch('http://' + url + path, {
            method: method,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Connection': 'keep-alive'
            },
            body: JSON.stringify(value)
          }).then(handleResponse);
        };
      });

      return invokeUntilResolved(funcs);
    });
  }

  function handleResponse(res) {
    if (res.status < 200 || res.status > 299) {
      throw new Error(res);
    }
    if (res.status !== 204) {
      return res.json();
    }
  }

  function getServices(tag){

    var funcs = config.discoveryServers.map(function (discoveryServer) {
      return function () {
        return fetch(discoveryServer + '/v1/catalog/services')
          .then(handleResponse);
      };
    });

    return invokeUntilResolved(funcs).then(function (result) {
      return Object.keys(result).filter(function(key){
        return tag ? result[key].indexOf(tag) !== -1 : key;
      });
    });
  }

  function getServiceUrlsByTag(tag){
    return getServices(tag)
      .then(function(result){
        return Promise
          .all(result.map(function (name) {
            return getServiceUrls(name)
              .then(function(data){
                var result = {};
                result[name] = data;
                return result;
              });
          }))
          .then(function(data){
            var result = {};
            data.forEach(function(itm){
              extend(result, itm);
            });
            return result;
          });
      });
  }

  function getServiceUrls(serviceName) {
    if (config.services[serviceName]) return Promise.resolve(config.services[serviceName]);

    var funcs = config.discoveryServers.map(function (discoveryServer) {
      return function () {
        return fetch(discoveryServer + '/v1/catalog/service/' + serviceName)
          .then(handleResponse);
      };
    });

    return invokeUntilResolved(funcs).then(function (result) {
      var serviceUrls = result.map(function (itm) {
        return itm.ServiceAddress + ':' + itm.ServicePort;
      });

      config.services[serviceName] = serviceUrls;
      return serviceUrls;
    });
  }

  function invokeUntilResolved(funcs) {
    return funcs.reduce(function (previous, next) {
      return previous.catch(next);
    }, Promise.reject(new Error('No discovery servers or resolver function specified.')));
  }

};
