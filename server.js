var http = require('http');

var CONFIG = require('./config').config;

var util        = require('util')
  , images      = require('./libraries/images.js').images
  , trends      = require('./libraries/trends.js').trends
  , twit     = require('./libraries/twitter.js').twit
  , error_404   = require('./helpers/url.js').error_404
  , crossdomain = require('./helpers/url.js').crossdomain;

var last_hashtag = 'ahsdasjdbsjah';

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
    var param = request.url.slice(14).split('/');

    // fetch the trends from Google Trends, if false return 404 error
    if (!trends.fetch(param[0], param[1], response)) {

      // set the error page
      error_404(response);
    }

  } else if (request.url === '/crossdomain.xml') {

    // set the crossdomain page
    crossdomain(response);
  } else if (request.url.search('/twitter/fetch') === 0) {
    var hashtag = request.url.slice(15);

    if (hashtag !== last_hashtag) {
        if (twit.stream !== undefined) {
          twit.stream.destroy();
        }

        twit.tweets = [];

        twit.start_stream([hashtag]);

        last_hashtag = hashtag;
    }

    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(twit.tweets));

    twit.tweets = [];
  } else {

     // set the error page
    error_404(response);
  }
}).listen(CONFIG.port, CONFIG.host);

// initilize Images
images.initialize();

// initilize Trends
// trends.initialize();

// initilize Twitter
//twitter.initialize(CONFIG);
