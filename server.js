var http = require('http');
var TwitterNode = require('twitter-node').TwitterNode
  , util        = require('util')
  , images      = require('./libraries/images.js').images
  , trends      = require('./libraries/trends.js').trends
  , error_404   = require('./helpers/url.js').error_404
  , crossdomain = require('./helpers/url.js').crossdomain;

http.createServer(function (request, response) {

  // verify which url the user access
  if (request.url.search('/images/fetch') === 0) {

    // fetch the images from Google Images, if false return 404 error
    if (! images.fetch(request.url.slice(14), response)) {

      // set the error page
      error_404(response);
    }
  } else if (request.url.search('/images/proxy') === 0) {

    // provide a proxy to Flash use the images
    images.proxy(request.url.slice(14), response);
  } else if (request.url.search('/trends/fetch') === 0) {

    // fetch the trends from Google Trends, if false return 404 error
    if (! trends.fetch(request.url.slice(14), response)) {

      // set the error page
      error_404(response);
    }

  } else if (request.url === '/crossdomain.xml') {

    // set the crossdomain page
    crossdomain(response);
  } else {

     // set the error page
    error_404(response);
  }
}).listen(1227, '10.228.20.213');

// initilize Images
images.initialize();

// initilize Trends
trends.initialize();