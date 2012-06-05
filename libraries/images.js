var http = require('http')
  , error_404   = require('../helpers/url.js').error_404;

/*
 *
 */
var images = {

  /*
   * Attempts to search
   *
   * @var integer
   */
  attempts: 0,

  /*
   * Query for the search
   *
   * @var string
   */
  query: '',

  /*
   * Start index of the first search result
   *
   * @var integer
   */
  start: 0,

  /*
   * Number of results to return per page
   *
   * @var integer
   */
  per_page: 8,

  /*
   * Images of search result
   * 
   * @var array
   */
  _data: [],

  /*
   * __construct
   * 
   * @return void
   */
  initialize: function() {
  },

  /*
   * Call the Google Image API and store the search result
   * on _data
   *
   * @param string Query or search expression
   * @param http.ServerResponse 
   * @return boolean
   */
  fetch: function(query, server_response) {

    // do not make unnecessary requests
    if (query.length < 1) return false;

    // verify if the query persists
    if (query != images.query) {

      // set the new query
      images.set_query(query);
    }

    // options for Google Image API request
    var options = {
      host: 'ajax.googleapis.com',
      port: 80,
      path: '/ajax/services/search/images?v=1.0&safe=active&q=' + query + '&start=' + images.start + '&rsz=' + images.per_page,
      method: 'GET'
    };

    // make the request
    var request = http.request(options, function(response) {

      // create the empty chunk
      var chunk = '';

      // set the response encode
      response.setEncoding('utf8');

      response
        
        // get the chunk of the request
        .on('data', function (_chunk) {

          // concatenate each part of the chunk
          chunk += _chunk;
        })

        // send to images data the parsed chunk
        .on('end', function() {

          // parse the chunk
          var content = JSON.parse(chunk);

          // verify if results are null
          if (content.responseData === null) {

            // if the system try more than 3 attempts, abort the system
            if (images.attempts > 3) {

              // clear the attempts
              images.attempts = 0;

              // show the 404 error
              error_404(server_response);
            } else {
              //log the attempts
              console.log('[Images Fetch] Attempts: ' + images.attempts + ' Start: ' + images.start);

              // reset the images
              images.start_reset();

              // remake the request
              images.fetch(query, server_response);

              // add count to attempts
              images.attempts++;
            }
          } else {

            // set the images data
            images.set_data(content.responseData.results);

            // send the content to server response
            images.end(JSON.stringify(images.get_data()), server_response, {'Content-Type': 'application/json'});

            // clear the attempts
            images.attempts = 0;
          }
        });
    });

    request

      // request error event
      .on('error', function(e) {
        //log the error
        console.log('Problem with images request: ' + e.message);

        // show the 404 error
        error_404(server_response);
      })

      // request end
      .end();

    // set the new start index of the search
    images.start += images.per_page;

    return true;
  },

  /*
   * Get the actual search result
   * 
   * @return void
   */
  get_data: function() {
    return images._data;
  },

  /*
   * Set and format the search result 
   * 
   * @param string The JSON of search result
   * @return void
   */
  set_data: function(result) {

    var data = [];

    // format each image
    for(var i = 0, size = result.length; i < size; ++i) {
      var image = result[i];

      // push the formated image to data
      data.push({
        url: image.unescapedUrl,
        width: image.width,
        height: image.height
      });

    }

    // set the image data
    images._data = data;
  },

  /*
   * ...
   *
   * @param http.ServerResponse
   * @return void
   */
   end: function(content, server_response, content_type) {

      // set the server header
      server_response.writeHead(200, content_type);

      // set the content and send the end
      server_response.end(content);

      // clear images on server response end
      images.clear();
   },

  /*
   * Set the new query for the search and reset the
   * start value
   *
   * @param string Query for search
   * @return void
   */
  set_query: function(query) {

    // se the new query value
    images.query = query;

    // reset the images
    images.start_reset();
  },

  /*
   * Reset the start value
   *
   * @return void
   */
  start_reset: function() {

    // reset the start value
    images.start = 0;
  },

  /*
   * Clear the search result
   *
   * @return void
   */
  clear: function() {

    // clear the _data of images
    images._data = [];
  },

  /*
   * Get the host, port and path from a url
   *
   * @param string Url of image
   * @return object Host, port and path
   */
  get_options_by_url: function(url) {

    // settings with protocol size to format the url
    var _protocol_size = {
      433 : 8,        // slice size for https://
      80 : 7,         // slice size for http://

    };

    // create the options empty
    var options = {}

    // get the default port for HTTP and HTTPS
    options.port = (url.search('https') > -1) ? 433 : 80;

    // get the url with domain and path
    var url_without_protocol = url.slice(_protocol_size[options.port]);

    // get the next bar "/"
    var first_bar_position = url_without_protocol.search('/');

    // get the host
    options.host = url_without_protocol.slice(0, first_bar_position);

    // get the path
    options.path = url_without_protocol.slice(first_bar_position);

    // return formated url
    return options;
  },

  /*
   * Proxy to load the images from
   * other servers
   *
   * @return void
   */
  proxy: function(image, server_response) {

    // do not make unnecessary requests
    if (image.length < 1) return;

    // get the options from the image url
    var url = images.get_options_by_url(image);

    // options for Google Image API request
    var options = {
      host: url.host,
      port: url.port,
      path: url.path,
      method: 'GET'
    };

    // make the request
    var request = http.request(options, function(response) {

      // set response header
      server_response.writeHead(200, {'Content-Type': 'image/jpeg'});

      // set the response encode
      response.setEncoding('binary');

      response
        
        // get the chunk of the request
        .on('data', function (_chunk) {

          // write each part of the chunk
          server_response.write(_chunk, 'binary');
        })

        // send to images data the parsed chunk
        .on('end', function() {

          // send the end command to the server response
          server_response.end();          
        });
    });

    request

      // request error event
      .on('error', function(e) {
        console.log('Problem with proxy request: ' + e.message);
      })

      // request end
      .end();

    return true;
  }
};


// Export module
module.exports.images = images;