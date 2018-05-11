const fca = require('./');

console.log('Starting.');

let options = {
  host : 'cs-crm-prjct-jgibbons894449.codeanyapp.com',
  port : 3000,
  public_key : 'abcde'
};

fca.authenticate(options).then((data) => {
  
})