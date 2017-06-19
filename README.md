# Qlik Sense JWT Authentication proof of concept

## Description:
This are proof of concept code to test JWT support in the Qlik Sense Proxy. Included is three examples with different flows used.
JWTTest.js
JWTTest_AuthServer.js
JWTTest_AuthServer_Client.js

## Installation
All these require that a virtual proxy with JWT authentication is setup with the name jwt. There is also a requirement that certificates are generated and
shared to validate the JWT.

Certificates can be generated using
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes