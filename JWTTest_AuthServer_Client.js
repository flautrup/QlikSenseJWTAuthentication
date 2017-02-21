/*
============================================================================================
File: JWTTest_AuthServer_Client.js
Developer: Fredrik Lautrup
Created Date: Feb 2017
Description:
Node web application that run on port 8185 that sends a small javascript to the browser that
fetch a JWT from an enpoint generated from a static definition. With the short lived JWT it 
requests a session from Qlik Sense and then redirects to the hub.
WARNING!:
This code is intended for testing and demonstration purposes only.  It is not meant for
production environments.  In addition, the code is not supported by Qlik.
Change Log
Developer                       Change Description                          Modify Date
--------------------------------------------------------------------------------------------
Fredrik Lautrup                 Initial Release                             Feb 2017
--------------------------------------------------------------------------------------------
============================================================================================
*/


// Load modules needed
var jwt = require('jsonwebtoken');
var fs = require('fs');
var https = require('https');
var express = require('express');

var app = express();

var bodyParser = require('body-parser');
var querystring = require("querystring");

//Start express app
var app = express();

//set the port for the listener here
app.set('port', 8185);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Return the JS to login
app.get('/login', function (req, res) {
    res.sendfile('JWTLogin.html');
});

//Returns a JWT in a JSON structure
app.get('/jwt', function (req, res) {
    var token = getToken();
    JSONreponse={ 'token': token };
    res.setHeader('content-type', 'application/json');
    res.send(JSONreponse);
});

//Create JWT Token
const getToken = () => {
    // sign with RSA SHA256
    var key = fs.readFileSync('key.pem');  // get private key
    //Create a JWT for subject jwtflp in JWTgroup finance signed with the private key using RS256 as algorithm
    // valid for 5 seconds
    var token = jwt.sign({ JWTgroup: 'Finance' }, key, { algorithm: 'RS256', subject: 'jwtflp', expiresIn: '5s' });

    console.log("\nJWT Token\n")
    console.log(token);
    return token;
}


//Server options to run an HTTPS server
var httpsoptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

//Start listener
https.createServer(httpsoptions, app).listen(8185);