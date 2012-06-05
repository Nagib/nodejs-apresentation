var http = require('http');


var util        = require('util')
  , images      = require('./libraries/images.js').images
  , trends      = require('./libraries/trends.js').trends
  , twitter     = require('./libraries/twitter.js').twitter
  , error_404   = require('./helpers/url.js').error_404
  , crossdomain = require('./helpers/url.js').crossdomain;

var arguments = process.argv.slice(2);
if (arguments.length !== 2) {
  console.log('Usage: node server.js TWITTER_USER TWITTER_PASSWORD');
  process.exit(1);
}

var twitter_user = arguments[0];
var twitter_password = arguments[1];


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
  } else if (request.url.search('/twitter/fetch') === 0) {
    var hashtag = request.url.slice(15);

    if (hashtag !== twitter.HASHTAG) {
        twitter.tweets = [];

        twitter.twit.trackKeywords = [];
        twitter.twit.track(hashtag);
        twitter.twit.stream();

        twitter.HASHTAG = hashtag;
    }

    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(twitter.tweets));

    twitter.tweets = [];
  } else {

     // set the error page
    error_404(response);
  }
}).listen(1227, '0.0.0.0');

// initilize Images
images.initialize();

// initilize Trends
// trends.initialize();

// initilize Twitter
twitter.initialize(twitter_user, twitter_password);
