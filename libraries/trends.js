var http = require('http')
  , https = require('https')
  , querystring = require('querystring')
  , error_404   = require('../helpers/url.js').error_404;

/*
 *
 */
var trends = {

  /*
   * Default Cookie
   *
   * @var string
   */
  cookie: 'SID=DQAAAOQAAACBbkf5G19RwvHkAABr5oRn0WZiM8tvocoIT8lrlaWPdPiiW-fBQYFq0pGFsB820JY6a3gGE2CJUTUmx4C8oxHNYElBmH-_c5Nfbyf6zzmjzjbJHxvYNsojcJWAwF9YlOnbOfGgQVK704XA26h4asvwWdBEiwG61IHvoCfcjHz54Wu1FJ-GqAmsBM7xV2t-FT0CuxWw54ay3g28Ig9Nx3uHaQOa9B-BvabGYPFJilGTl83MTtFN6xkrSXsqCKkI3NRGw7ZNzkA-dFsTwH7j0aK1tH-7FfDAUGYXYAAHnnwIe3O9262FgVIzH6ZKakK2GMc;Domain=.google.com.br;Path=/;Expires=Fri, 03-Jun-2022 18:51:44 GMT, HSID=A5lG-zkl3oU5Cla0I;Domain=.google.com.br;Path=/;Expires=Fri, 03-Jun-2022 18:51:44 GMT;HttpOnly, SSID=AVGAUBY3dZdimSGWx;Domain=.google.com.br;Path=/;Expires=Fri, 03-Jun-2022 18:51:44 GMT;Secure;HttpOnly',

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
   * Credentials for sign in on Google
   * 
   * @var array
   */
  credentials: {
    user: '',
    password: ''
  },

  /*
   * Content of search result
   * 
   * @var array
   */
  _data: [],

  /*
   * __construct
   * 
   * @param http.ServerResponse 
   * @return void
   */
  initialize: function() {
  },

  /*
   * Call the Google Trends and store the search result
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
    if (query === trends.query) {

      // send "end" to server response
      trends.end(server_response);

      // dont fetch anymore
      return true;
    } else {

      // set the new query
      trends.query = query;
    }

    // options for Google Trends request
    var options = {
      host: 'www.google.com.br',
      port: 80,
      path: '/trends/viz?q=' + query + '&graph=all_csv&scale=1&sa=N',
      method: 'GET',
      headers: {
        'Referrer': 'https://www.google.com/accounts/ServiceLoginBoxAuth',
        'Content-type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.5 Safari/534.55.3',
        'Accept': 'text/plain',
        'Set-Cookie': 'SID=DQAAAOQAAACBbkf5G19RwvHkAABr5oRn0WZiM8tvocoIT8lrlaWPdPiiW-fBQYFq0pGFsB820JY6a3gGE2CJUTUmx4C8oxHNYElBmH-_c5Nfbyf6zzmjzjbJHxvYNsojcJWAwF9YlOnbOfGgQVK704XA26h4asvwWdBEiwG61IHvoCfcjHz54Wu1FJ-GqAmsBM7xV2t-FT0CuxWw54ay3g28Ig9Nx3uHaQOa9B-BvabGYPFJilGTl83MTtFN6xkrSXsqCKkI3NRGw7ZNzkA-dFsTwH7j0aK1tH-7FfDAUGYXYAAHnnwIe3O9262FgVIzH6ZKakK2GMc;Domain=.google.com.br;Path=/;Expires=Fri, 03-Jun-2022 18:51:44 GMT, HSID=A5lG-zkl3oU5Cla0I;Domain=.google.com.br;Path=/;Expires=Fri, 03-Jun-2022 18:51:44 GMT;HttpOnly, SSID=AVGAUBY3dZdimSGWx;Domain=.google.com.br;Path=/;Expires=Fri, 03-Jun-2022 18:51:44 GMT;Secure;HttpOnly'
      }
    };

    // make the request
    var request = http.request(options, function(response) {

      // create the empty chunk
      var content = '';

      // set the response encode
      response.setEncoding('utf8');

      response
        
        // get the chunk of the request
        .on('data', function (_chunk) {

          // concatenate each part of the chunk
          content += _chunk;
        })

        // send to trends data the parsed chunk
        .on('end', function() {

          // set the trends data
          trends.set_data(content);

          // send "end" to server response
          trends.end(server_response);
        });
    });

    request

      // request error event
      .on('error', function(e) {

        //log the error
        console.log('Problem with trends request: ' + e.message);

        // show the 404 error
        error_404(server_response);
      })

      // request end
      .end();

    return true;
  },

  /*
   * Get the actual search result
   * 
   * @return void
   */
  get_data: function() {
    return trends._data;
  },

  /*
   * Set the trends result
   * 
   * @param string The string of trends
   * @return void
   */
  set_data: function(content) {

    // set the trends data
    trends._data = content;
  },

  /*
   * ...
   *
   * @param http.ServerResponse
   * @return void
   */
  end: function(server_response) {

    // verify the authentication
    if (! trends.auth.logged) {

       //log the error
        console.log('User not logged for Google Trends');

        // show the 404 error
        error_404(server_response);
    } else {

      // set the server header
      server_response.writeHead(200, {'Content-Type': 'text/csv'});

      // set the content and send the end
      server_response.end(trends._data);
    }
  },
};

// Export module
module.exports.trends = trends;