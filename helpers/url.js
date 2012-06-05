module.exports = {

  /*
   * Send the 404 error to the browser
   *
     * @param http.ServerResponse 
   * @return void
   */
  error_404: function(response) {

    // set the headers
      response.writeHead(404, {'Content-Type': 'text/plain'});
      
      // set the content of 404 error page
      response.end('404 Not Found\n');
  },

  /*
   * Send the crossdomain authorization (crossdomain.xml) to the browser
   *
     * @param http.ServerResponse 
   * @return void
   */
  crossdomain: function(response) {

      // set the headers
      response.writeHead(200, {'Content-Type': 'application/xml'});

      // set the content of crossdomain.xml
      response.end(
        '<?xml version="1.0" encoding="UTF-8"?><cross-domain-policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.adobe.com/xml/schemas/PolicyFile.xsd">\n'
        + '<allow-access-from domain="*" />\n'
        + '<site-control permitted-cross-domain-policies="master-only"/>\n'
        + '</cross-domain-policy>');
  }
};