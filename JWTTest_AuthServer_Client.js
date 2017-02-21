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

//Define endpoint for login using JWT
app.get('/login', function (req, res) {
    res.sendfile('JWTLogin.html');
});

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