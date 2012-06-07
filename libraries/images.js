var http = require('http')
  , error_404   = require('../helpers/url.js').error_404
  , fs          = require('fs');


/*
 *
 */
var images = {

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
   * Cache for Images of search result
   *
   * @var object
   */
  _cache: {},

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

    // initilize cache
    images.cache.initialize(query);

    // options for Google Image API request
    var options = {
      host: 'ajax.googleapis.com',
      port: 80,
      path: '/ajax/services/search/images?v=1.0&safe=active&q=' + query + '&start=' + images._cache[query].start + '&rsz=' + images.per_page,
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
          if (content.responseData !== null) {

            // set the images data
            images.cache.set_data(content.responseData.results, query);
          } else {

            //log the error
            console.log('Images error: can\'t fetch more images. Query: ' + query);
          }

          // send the content to server response
          images.end(JSON.stringify(images.cache.get_data(query)), server_response, {'Content-Type': 'application/json'});

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

    return true;
  },

  /*
   * Cache Object for images
   *
   * @
   */
  cache: {

    /*
     * Initilize the cache for the query
     *
     * @param string query for get data
     * @return void
     */
    initialize: function(query) {

      // initilize cache by get
      images._cache = JSON.parse(fs.readFileSync('./cache/data.json', 'utf-8'));

      // verify if the cache for the query exists and create
      if (! images._cache[query]) {
        images._cache[query] = {
          start: 0,
          last_index: -1,
          _data: []
        }
      }
    },

    /*
     * Get the actual search result
     *
     * @param string query for get data
     * @return void
     */
    get_data: function(query) {
      return images._cache[query] && images._cache[query]._data ? images._cache[query]._data : [];
    },

    /*
     * Set and format the search result
     *
     * @param string The JSON of search result
     * @param string query for set data
     * @return void
     */
    set_data: function(result, query) {

      // format each image
      for(var i = 0, size = result.length; i < size; ++i) {
        var image = result[i];

        // push the formated image to query cache data
        images._cache[query]._data.push({
          url: image.unescapedUrl,
          width: image.width,
          height: image.height
        });

      }

      // set the max index created
      images._cache[query].last_index = images._cache[query]._data.length - 1;

      // set the new start index of the search
      images._cache[query].start += images.per_page;

      //save to cache file
      fs.writeFileSync('./cache/data.json', JSON.stringify(images._cache), 'utf8', function(err) {

        if (err)
          console.log('Cant\'t save the file. Query: ' + query);
      });
    }
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
        server_response.end();
      })

      // request end
      .end();

    return true;
  }
};


// Export module
module.exports.images = images;