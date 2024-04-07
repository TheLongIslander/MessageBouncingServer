Message-Bouncing Server Project

This project involves creating a simple application server in NodeJS that accepts HTTP POST requests and bounces back the message body for specific content types. The server does not use any web application frameworks such as Express.js; instead, it's built using only NodeJS's core modules and a few external dependencies for parsing XML and HTML content.

----------------------------------------------------------------------------------------
Dependencies:

The server uses the following NodeJS modules and external libraries:

http: A core NodeJS module to create HTTP server.
url: A core NodeJS module for URL resolution and parsing.
jsdom: A JavaScript based headless browser useful for parsing and manipulating HTML content.
xml2js: A library to convert XML data into a JavaScript object and vice versa.


To install these dependencies, run the following command:

	npm install jsdom xml2js

Make sure you have NodeJS installed on your system to use npm for installing packages.

----------------------------------------------------------------------------------------
Running the Server:

To start the server, navigate to the project directory in your terminal and run:

	node server.js

This command starts the server on port 3000. You can access it by sending HTTP requests to http://localhost:3000.
----------------------------------------------------------------------------------------
Testing:

Automated tests are written using Jasmine and SuperTest libraries to test the server's response to different types of HTTP requests. These tests verify the server's behavior for supported content types, error handling for unsupported types or malformed bodies, and adherence to the payload size limit and rate limiting rules.

To run the tests, execute:

	jasmine

Make sure you have Jasmine and SuperTest installed and configured in your project:

	npm install --save-dev jasmine supertest

----------------------------------------------------------------------------------------

Project Structure:

server.js: Contains the server implementation.
spec/server.spec.js: Contains Jasmine tests for the server.
Refer to package.json for a complete list of dependencies and scripts.


----------------------------------------------------------------------------------------

Server Functionality:

The server supports handling of various content types including:

application/json
text/plain
application/x-www-form-urlencoded
application/xml
text/html

application/javascript
For each supported content type, the server attempts to parse the incoming request body. If the body can be successfully parsed, the server immediately copies the content and bounces it back to the client in the response message.

----------------------------------------------------------------------------------------
Handling Large Payloads:

To prevent denial-of-service attacks through excessively large payloads, the server imposes a maximum payload size limit of 1 megabyte (1e6 bytes). Requests exceeding this size limit are responded to with a 413 Payload Too Large status code.
----------------------------------------------------------------------------------------
Rate Limiting:

Basic rate limiting is implemented to prevent abuse. The server tracks the number of requests from each client IP address and limits the allowed number of requests. Clients exceeding the limit receive a 429 Too Many Requests response.
----------------------------------------------------------------------------------------
Error Handling:

The server is designed to handle client errors gracefully. Unsupported content types result in a 415 Unsupported Media Type response. Malformed message bodies, where parsing fails, lead to a 400 Bad Request response. Other errors are managed according to the HTTP status codes best practices.