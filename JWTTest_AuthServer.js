/*
============================================================================================
File: JWTTest_AuthServer.js
Developer: Fredrik Lautrup
Created Date: Feb 2017
Description:
Node web application running on port 8185 that creates a JWT for hard coded data and requests
a session using it. It then sets the Qlik Sense session to the browser.
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
app.use(bodyParser.urlencoded({
    extended: true
}));

//Define endpoint for login using JWT
app.get('/login', function (req, res) {
    var token = getToken();
    reqWithToken(token).then((response) => {
        res.setHeader('set-cookie', response); //Respond with cookie collected using JWT
        res.status(200).send("Login");
    })
});

//Create JWT Token
const getToken = () => {
    // sign with RSA SHA256
    var key = fs.readFileSync('key.pem'); // get private key
    //Create a JWT for subject jwtflp in JWTgroup finance signed with the private key using RS256 as algorithm
    //valid in 5 seconds
    var token = jwt.sign({
        JWTgroup: 'Finance'
    }, key, {
        algorithm: 'RS256',
        subject: 'jwtflp',
        expiresIn: '5s'
    });

    console.log("\nJWT Token\n")
    console.log(token);
    return token;
}

//Request a resource from Qlik Sense server with JWT to obtain a cookie
const reqWithToken = (token) => {
    return new Promise((resolv, reject) => {
        var cookie;
        //Create request to Qlik Sense server using the JWT on a virtual proxy called jwt
        var options = {
            hostname: 'rd-flp-67.rdlund.qliktech.com', //Server
            port: 443,
            path: '/jwt/qrs/about?xrfkey=aaaaaaaaaaaaaaaa', //Request the about information
            method: 'GET',
            headers: {
                'X-qlik-xrfkey': 'aaaaaaaaaaaaaaaa',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }, //CSRF token and JWT added to header
            rejectUnauthorized: false //Don't verify Qlik Sense certificate
        };

        //Send request
        var req = https.request(options, (res) => {
            console.log("\nResponse headers\n")
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            cookie = res.headers['set-cookie'];

            res.on('data', (d) => {
                process.stdout.write("\nResponse from server\n");
                process.stdout.write(d);
                resolv(cookie);
            });
        });

        console.log("\nRequest Authorization header\n");
        console.log('Authorization: ' + req.getHeader('Authorization'));

        req.on('error', (e) => {
            console.error(e);
        });
        req.end();

    })
}

//Server options to run an HTTPS server
var httpsoptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

//Start listener
https.createServer(httpsoptions, app).listen(8185);