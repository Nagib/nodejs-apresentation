var http = require('http')
  , querystring = require('querystring')
  , error_404   = require('../helpers/url.js').error_404;

/*
 *
 */
var trends = {

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
   * @return void
   */
  initialize: function(server_request, server_response) {
    trends.signin();
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
      trends.end();

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
      method: 'GET'
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
          trends.end();
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

    // set the server header
    server_response.writeHead(200, {'Content-Type': 'text/csv'});

    // set the content and send the end
    server_response.end(trends._data);
  },

  /*
   * Sign in the user on Google
   * 
   * @return void
   */
  signin: function() {

    //
    var cookie_check = '';

    //
    var login_box_auth = ''

    //
    var headers = '';

    galx = new RegExpression();










  }

};


// Export module
module.exports.trends = trends;