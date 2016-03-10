# lc-http-client

__A HTTP client (Browsers and NodeJS) with Consul service discovery and endpoint fallbacks.__

## Build

`npm run build`

## NodeJS specs

`npm test`

## Browser

`<script src="lc-http-client.js"></script>`

## NodeJS

`var httpClient = require('lc-http-client');`

## API

```
var DISCOVERY_SERVICE_URLS = [
  'http://{your consul service}:8500',
  'http://{your consul service 2}:8500'
];

HTTPClient({ discoveryServers: DISCOVERY_SERVICE_URLS })
.get({yourServiceName}, {yourEndpointName})
.then(function(data){
  console.log(data);
})
.catch(function(error){
  console.error(error);
});
```

