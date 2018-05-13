const fca = require('./');

console.log('Starting.');

let options = {
  host : 'localhost',
  port : 3000,
  public_key : '7cf7eba8-5d46-48a9-ac2e-6ad49128cbb5'
};

fca.init(options, (err, result) => {
	if(err) throw err;
	console.log(`=> Connected to FCA As (${result.application_name})`);
});

fca.create_client({name: 'James'}).then(() => {
	console.log('Created client');
})