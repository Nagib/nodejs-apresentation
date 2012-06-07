var http = require('http');

var CONFIG = require('./config').config;

var hashtag_list = require('./config').read('hashtag');
console.log(hashtag_list);

var util        = require('util')
  , images      = require('./libraries/images.js').images
  , trends      = require('./libraries/trends.js').trends
  , twit        = require('./libraries/twitter.js').twit
  , error_404   = require('./helpers/url.js').error_404
  , crossdomain = require('./helpers/url.js').crossdomain
  , qs          = require('querystring');

//var last_hashtag = 'ahsdasjdbsjah';

twit.start_stream(hashtag_list);

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
  } else if (request.url === '/twitter/change') {
    if (request.method === 'GET') {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end('<form method="post"><input name="hashtag" size="100" value="' + hashtag_list.join(' ') + '" type="text" /><input type="submit" /></form>');
    }
    else {
      var data = "";

      request.on("data", function(chunk) {
          data += chunk;
      });

      request.on("end", function() {
          hashtag_list = qs.parse(data).hashtag.split(' ');

          // Resets the Twitter stream
          twit.stream.destroy();
          twit.start_stream(hashtag_list);

          require('fs').writeFile("./config/hashtag.json", JSON.stringify(hashtag_list), function(err) {
              response.writeHead(200, {'Content-Type': 'text/html'});
              if (err) {
                console.log(err);
                response.end('<h1>Error!</h1>');
              } else {
                response.end('<h1>Oba! alterou</h1>');
              }
          });


      });


    }

  } else if (request.url.search('/twitter/fetch') === 0) {
    var hashtag = request.url.slice(15);

    if (twit.tweets[hashtag] !== undefined) {
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(twit.tweets[hashtag]));
    }
    else {
      error_404(response);
    }
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
