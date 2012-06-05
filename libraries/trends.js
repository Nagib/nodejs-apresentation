var http = require('http')
  , https = require('https')
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
   * @param http.ServerResponse 
   * @return void
   */
  initialize: function() {
    trends.auth.initialize();
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

  /*
   * Auth object for Google
   * 
   * @return void
   */
  auth: {

    /*
     * Store logged status
     *
     * @var boolean
     */
    logged: false,

    /*
     * GALX - input validation for Google Auth
     *
     * @var string
     */
    galx_expression: '<input type="hidden" name="GALX" value="([a-zA-Z0-9_-]+)">',

    /*
     * Settings for cookie check
     *
     * @var object
     */
    check_cookie_settings: {
      host: 'www.google.com',
      port: 443,
      path: '/accounts/CheckCookie?chtml=LoginDoneHtml'
    },

    /*
     * Settings for login box authentication
     *
     * @var object
     */
    login_box_auth_settings: {
      host: 'accounts.google.com',
      port: 443,
      path: '/ServiceLoginBoxAuth'
    },

    /*
     * Default headers for authentication
     *
     * @var object
     */
    headers: {
      'Referrer': 'https://www.google.com/accounts/ServiceLoginBoxAuth',
      'Content-type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.5 Safari/534.55.3',
      'Accept': 'text/plain'
    },

    /*
     * Sign in the user on Google
     * 
     * @return void
     */
    initialize: function() {

      // options for Google Login Box Auth request
      var options = {
        host: trends.auth.login_box_auth_settings.host,
        port: trends.auth.login_box_auth_settings.port,
        path: trends.auth.login_box_auth_settings.path,
        method: 'POST',
        headers: trends.auth.headers
      };

      // make the request
      var request = https.request(options, function(response) {

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

            // get the galx
            var galx = trends.auth.get_galx(content);

            // signin Google width galx
            trends.auth.signin(galx);
          });
      });

      request

        // request error event
        .on('error', function(e) {

          //log the error
          console.log('Problem with trends signin initialize request: ' + e.message);
        })

        // request end
        .end();
    },

    /*
     * Sign in the user on Google
     * 
     * @param string GALX from auth box
     * @return void
     */
    signin: function(galx) {

      // options for Google Login Box Auth request
      var options = {
        host: trends.auth.login_box_auth_settings.host,
        port: trends.auth.login_box_auth_settings.port,
        path: trends.auth.login_box_auth_settings.path,
        method: 'POST',
        headers: trends.auth.headers
      };

      // post data do authentication
      var data = querystring.stringify({
        GALX: galx,
        continue: 'http://www.google.com/trends',
        PersistentCookie: 'yes',
        Email: 'developer@cubo.cc',
        Passwd: 'cuboccsphota',
        rmShown: 1
      });

      // make the request
      var request = https.request(options, function(response) {

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

            console.log(content);

            // check the cookie
            trends.auth.check_cookie();
          });
      });

      // send the post data
      request.write(data);

      request

        // request error event
        .on('error', function(e) {

          //log the error
          console.log('Problem with trends signin request: ' + e.message);
        })

        // request end
        .end();
    },

    /*
     * Check the cookie after authentication
     * 
     * @return void
     */
    check_cookie: function() {

      // options for Google Login Box Auth request
      var options = {
        host: trends.auth.check_cookie_settings.host,
        port: trends.auth.check_cookie_settings.port,
        path: trends.auth.check_cookie_settings.path,
        method: 'POST',
        headers: trends.auth.headers
      };

      // make the request
      var request = https.request(options, function(response) {


      });

      request

        // request error event
        .on('error', function(e) {

          //log the error
          console.log('Problem with trends check cookie request: ' + e.message);
        })

        // request end
        .end();
    },

    /*
     * Get the GALX from the login page
     * 
     * @return string
     */
    get_galx: function(page_content) {

      // match the galx
      var galx = page_content.match(trends.auth.galx_expression);

      // return the galx value
      return galx[1];
    }
  }

};

// Export module
module.exports.trends = trends;