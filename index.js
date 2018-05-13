/**
  * Flip CRM API wrapper package for NodeJs.
  * @author James Gibbons
  * @author Flip Multimedia
  * @version 0.0.1
*/

const http = require('http');
const md5 = require('md5');

/**
  * This is where the options will be
  * stored after the inital authentication.
  * mainly for ease of use.
*/
let global_options = {};
let global_params = {};

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
  * Function used to ensure that the API
  * has been setup, using the init() method.
  * this will not return anything, but will 
  * instead throw an error.
*/
function ensure_init(){
  if(!global_options){
    throw "[FCA API Error] => The API has not been started. Please call the init() method before making requests.";
  }
}

/**
  * Function used to convert a public_key
  * to a live token that can be used when
  * making requests to the CRM. Each token 
  * is only valid for making single requests,
  * and should not be stored.
  * @param public_key The public key generated by the CRM.
  * @returns Promise that resolves the single use token.
 */
function authenticate(callback){
  let query_string = global_options.query_string + 'gen-auth-token?key=' + global_options.public_key;
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
      let the_token = data;
      callback(the_token);
    });
    
    
    /**
      * error handling. This will only happen
      * if the URL given is incorrect.
    */
    res.on('error', (err) => {
      throw `[FLIP CRM] => ${err}`;
    })
  })
}

/**
  * Method used to setup the options with the
  * module, this will also test the connection
  * to ensure that the options given are valid.
  * @param Options the options.
*/
exports.init = (options, callback) => {
  options = get_options(options);
  let query_string = options.query_string + 'test-connection?public_key=' + options.public_key
  http.get(query_string, (res) => {

    /**
      * Called when there is a reply
    */
    res.on('data', (data) => {
      if(callback){

        /** 
          * This should be the FCA server returning the given
          * application name that is associated with the key
          * that has been provided. We will apply this to the 
          * global params object for later use.
        */
        if(data == 'invalid-key'){
          console.log('[FCA Request Public Key] => ' + options.public_key);
          throw "[FCA API Error] => Invalid public key given to the FCA API";
        }
        else{
          global_params.application_name = data;
          callback(false, {application_name: global_params.application_name});
        }
      }
    });

    /**
      * Called if there is an error.
    */
    res.on('error', (error) => {
      if(callback){
        callback(`[FCA API Error] => ${error}`);
      }
      else{
        throw error;
      }
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
  * @param token - Now generated within the method.
  * @param client The client data.
  * @return Promise with the client ID
*/
exports.create_client = (client) => {
  return new Promise((resolve, reject) => {
    if(typeof client !== undefined){
      authenticate((token) => {
        // Ensure everything is valid with the user object
        if(!client.name) client.name = '';
        if(!client.email) client.email = '';
        if(!client.phone) client.phone = '';
        if(!client.business) client.business = '';
        if(!client.website) client.website = '';
        if(!client.notes) client.notes = '';

        // Genrate the query string for the request.
        let query_string = global_options.query_string;
            query_string += 'create-client?'
            query_string += 'token=' + token
            query_string += '&business=' + client.business
            query_string += '&name=' + client.name
            query_string += '&email' + client.email
            query_string += '&phone' + client.phone
            query_string += '&website' + client.website
            query_string += '&notes' + client.notes

        http.get(query_string, (res) => {
      
          /**
            * Called upon a response.
          */
          res.on('data', (data) => {
            if(data == '1'){
              resolve()
            }
            else{
              reject()
            }
          })
        })
      })
    }
  })
}