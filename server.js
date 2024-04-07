const http = require('http');
const { URLSearchParams } = require('url');
const { parseString } = require('xml2js');
const { JSDOM } = require('jsdom');

const supportedContentTypes = [
  'application/json',
  'text/plain',
  'application/x-www-form-urlencoded',
  'application/xml',
  'text/html',
  'application/javascript'
];

const MAX_PAYLOAD_SIZE = 1e6; // 1 Megabyte
const requestCount = new Map(); // Basic rate limiting

const server = http.createServer((req, res) => {
  const clientIP = req.connection.remoteAddress;
  const requests = (requestCount.get(clientIP) || 0) + 1;
  requestCount.set(clientIP, requests);

  if (requests > 100) {
    res.writeHead(429, { 'Content-Type': 'text/plain' });
    res.end('Too Many Requests: Please slow down.');
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const contentType = req.headers['content-type'];
  if (!supportedContentTypes.includes(contentType)) {
    res.writeHead(415, { 'Content-Type': 'text/plain' });
    res.end(`Unsupported Media Type, supported types are: ${supportedContentTypes.join(', ')}`);
    return;
  }

  const contentLength = req.headers['content-length'];
  if (contentLength && Number(contentLength) > MAX_PAYLOAD_SIZE) {
    res.writeHead(413, { 'Content-Type': 'text/plain' });
    res.end('Payload Too Large: Maximum size is 1MB');
    return;
  }

  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
    if (Buffer.concat(body).length > MAX_PAYLOAD_SIZE) {
      res.writeHead(413, { 'Content-Type': 'text/plain' });
      res.end('Payload Too Large: Maximum size is 1MB');
      req.connection.destroy();
    }
  }).on('end', () => {
    body = Buffer.concat(body).toString();

    // Handling different content types
    handleContentType(contentType, body, res);
  });
});

const PORT = 3000;
if (require.main === module) {
  // This block will only execute if this file is run directly (e.g., node server.js)
  // and not when imported as a module in test files.
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
function handleContentType(contentType, body, res) {
  switch (contentType) {
    case 'application/json':
      handleJson(body, res);
      break;
    case 'application/x-www-form-urlencoded':
      handleForm(body, res);
      break;
    case 'application/xml':
      handleXml(body, res);
      break;
    case 'application/javascript':
    case 'text/plain':
    case 'text/html':
      handleTextTypes(contentType, body, res);
      break;
    default:
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Content type handling not implemented');
  }
}

function handleJson(body, res) {
  try {
    const parsedJson = JSON.parse(body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(parsedJson));
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request: Body could not be parsed as JSON');
  }
}

function handleForm(body, res) {
  const parsedForm = new URLSearchParams(body);
  res.writeHead(200, { 'Content-Type': 'application/x-www-form-urlencoded' });
  res.end(parsedForm.toString());
}

function handleXml(body, res) {
  const parserOptions = {
    // Explicitly set options to prevent malicious XML processing
    explicitCharkey: false,
    trim: true,
    normalize: true,
    explicitArray: false,
    ignoreAttrs: true,
    // Add more options here to disable external entities, etc.
  };
  parseString(body, parserOptions, (err, result) => {
    if (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: Body could not be parsed as XML');
    } else {
      res.writeHead(200, { 'Content-Type': 'application/xml' });
      // Consider converting 'result' back to a string or handling it appropriately
      res.end(body);
    }
  });
}

function handleTextTypes(contentType, body, res) {
  if (contentType === 'text/html') {
    // Check if the body contains at least one HTML tag
    if (/\<(.*?)\>/.test(body)) {
      try {
        new JSDOM(body); // This will parse the body as HTML
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(body); // Send back the original body if it is well-formed
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request: Body could not be parsed as well-formed HTML');
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: HTML content must contain at least one HTML tag.');
    }
  } else {
    // For text/plain and application/javascript, echoing back the content should be fine
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  }
}
// In your server code, instead of automatically starting the server, export it:
module.exports = server;
