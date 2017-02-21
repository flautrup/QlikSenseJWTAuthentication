// Load modules needed
var jwt = require('jsonwebtoken');
var fs = require('fs');
var https = require('https');
var express=require('express');

// sign with RSA SHA256
var key = fs.readFileSync('key.pem');  // get private key
//Create a JWT for subject jwtflp in JWTgroup finance signed with the private key using RS256 as algorithm
var token = jwt.sign({ JWTgroup: 'Finance' }, key, { algorithm: 'RS256', subject: 'jwtflp' });

console.log("\nJWT Token\n")
console.log(token);

// verify a token with the public key to make sure it is correct
var cert = fs.readFileSync('cert.pem');
var decoded = jwt.verify(token, cert);

console.log("\nVerified token\n");
console.log(decoded)

//Create request to Qlik Sense server using the JWT on a virtual proxy called jwt
var options = {
  hostname: 'rd-flp-67.rdlund.qliktech.com', //Server
  port: 443,
  path: '/jwt/qrs/about?xrfkey=aaaaaaaaaaaaaaaa', //Request the about information
  method: 'GET',
  headers: { 'X-qlik-xrfkey': 'aaaaaaaaaaaaaaaa', 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, //CSRF token and JWT added to header
  rejectUnauthorized: false //Don't verify Qlik Sense certificate
};

//Send request
var req = https.request(options, (res) => {
  console.log("\nResponse headers\n")
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write("\nResponse from server\n");
    process.stdout.write(d);
  });
});

    console.log("\nRequest Authorization header\n");
    console.log(req.getHeader('Authorization'));

req.on('error', (e) => {
  console.error(e);
});
req.end();

