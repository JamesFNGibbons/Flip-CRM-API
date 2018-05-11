/**
  * Flip CRM API wrapper package for NodeJs.
  * @author James Gibbons
  * @author Flip Multimedia
  * @version 0.0.1
*/

const http = require('http');

/**
  * This is where the options will be
  * stored after the inital authentication.
  * mainly for ease of use.
*/
let global_options;

/**
  * Function used to handle an options
  * paramater being given.
  * @return request options in JSON array.
*/
function get_options(options){
  let the_options = {
    host : '',
    port : 3000,
    use_ssl : false,
    public_key : undefined
  }
  
  if(options){
    if(options.is_local) the_options.host = 'localhost';
    if(options.host) the_options.host = options.host;
    if(options.port) the_options.port;
    if(options.use_ssl) the_options.use_ssl = options.use_ssl;
    if(options.public_key) {
      the_options.public_key = options.public_key
    }
    else{
      throw "[FLIP CRM] => A valid public key is required."
    }
  }
  
  // Trim the protocol off the host if given
  the_options.host.replace('http://', '');
  the_options.host.replace('https://', '');
  
  // Prebuild the query URL
  if(the_options.use_ssl){
    the_options.query_string = `https://${the_options.host}:${the_options.port}/api/`;
  }
  else{
    the_options.query_string = `http://${the_options.host}:${the_options.port}/api/`;
  }
  
  // Mirror the options to the global options.
  global_options = the_options;
  
  return the_options;
}

/**
  * Function used to validate that a token
  * is valid. This will return a promise, and 
  * will only be used to validate 

/**
  * Function used to convert a public_key
  * to a live token that can be used when
  * making requests to the CRM. Each token 
  * is only valid for making single requests,
  * and should not be stored.
  * @param public_key The public key generated by the CRM.
  * @returns Promise that resolves the single use token.
 */
exports.authenticate = (options) => {
  return new Promise((resolve, reject) => {
    options = get_options(options);
    let query_string = options.query_string + 'gen-auth-token';
    http.get(query_string, (res) => {
      let data = '';

      /**
        * Called when the app should be returning
        * the public key. We will keep the connection
        * open until this has completed.
       */
      res.on('data', (data_chunk) => {
        data+= data_chunk;
      })

      /**
        * Called whrn the connection has closed.
      */
      res.on('end', () => {
        let the_token = md5(data);
        resolve(the_token);
      });
      
      
      /**
        * error handling. This will only happen
        * if the URL given is incorrect.
      */
      res.on('error', (err) => {
        throw `[FLIP CRM] => ${err}`;
      })
    })
  })
}

/**
  * Method used to create a new client, and
  * save them to the CRM. This method requires
  * both a JSON object of client data, and the
  * pre generated authentication token. This will 
  * return through a promise the ID of the new created
  * client.
  * @param token The auth token 
  * @param client The client data.
  * @return Promise with the client ID
*/
exports.create_client = (token, client) => {
  return new Promise((resolve, reject) => {
    if(token && client){
      
    }
  })
}