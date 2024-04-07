const request = require('supertest');
let server; // No need to specify PORT or import http

describe('Server Test Suite', () => {
  beforeAll(() => {
    // Import the server module
    server = require('../server'); // Ensure this exports your Express app or equivalent
  });

  // No need for an afterAll to close the server; Supertest handles this

  it('should return 405 for GET requests', (done) => {
    request(server)
      .get('/') // Specify the route you want to test
      .expect(405) // Supertest allows you to directly check the status code
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });
  it('should handle application/json content type correctly', (done) => {
    const postData = { test: 'data' }; // Supertest can handle object directly

    request(server)
      .post('/') // Specify the POST route
      .send(postData) // Supertest's .send() automatically sets Content-Type to application/json
      .expect(200) // Check for the status code
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toBe(JSON.stringify(postData)); // Supertest returns response in res.text
        done();
      });
  });

  it('should handle text/plain content type correctly', (done) => {
    const textData = 'Simple text message';
    request(server)
      .post('/') // Specify the POST route
      .set('Content-Type', 'text/plain')
      .send(textData) // Sending text data
      .expect(200) // Expecting HTTP status 200
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toBe(textData); // Expecting the echoed back text
        done();
      });
  });
  it('should handle application/x-www-form-urlencoded content type correctly', (done) => {
    const formData = { key: 'value' };
    request(server)
      .post('/') // Specify the POST route
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(formData) // Sending form data
      .expect(200) // Expecting HTTP status 200
      .end((err, res) => {
        if (err) return done(err);
        // Expecting the echoed back form data, needs to be URL encoded
        expect(res.text).toBe('key=value');
        done();
      });
  });
  it('responds to valid JSON body with the same JSON', async () => {
    request(server)
      .post('/')
      .send({ message: 'Hello, JSON!' })
      .set('Content-Type', 'application/json')
      .expect(200, { message: 'Hello, JSON!' })
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return err;
      });
  });
  it('responds with xml', function(done) {
    request(server)
      .post('/')
      .set('Content-Type', 'application/xml')
      .send('<note><to>User</to><from>Server</from></note>')
      .expect(200)
      .expect('Content-Type', /xml/)
      .expect('<note><to>User</to><from>Server</from></note>')
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
  it('responds to valid XML body with the same XML', async () => {
    request(server)
      .post('/')
      .send('<note><body>Hello, XML!</body></note>')
      .set('Content-Type', 'application/xml')
      .expect(200, '<note><body>Hello, XML!</body></note>')
      .expect('Content-Type', /xml/)
      .end((err, res) => {
        if (err) return err;
      });
  });
  it('responds to valid HTML body with the same HTML', async () => {
    request(server)
      .post('/')
      .send('<!DOCTYPE html><html><body>Hello, HTML!</body></html>')
      .set('Content-Type', 'text/html')
      .expect(200, '<!DOCTYPE html><html><body>Hello, HTML!</body></html>')
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return err;
      });
  });
  it('responds with 413 Payload Too Large when data exceeds the limit', async () => {
    const largeData = 'a'.repeat(1e6 + 1); // 1MB + 1 byte
    request(server)
      .post('/')
      .send(largeData)
      .set('Content-Type', 'text/plain')
      .expect(413)
      .end((err, res) => {
        if (err) return err;
      });
  });
  it('responds to JavaScript body with the same JavaScript code', async () => {
    request(server)
      .post('/')
      .send('console.log("Hello, JavaScript!");')
      .set('Content-Type', 'application/javascript')
      .expect(200, 'console.log("Hello, JavaScript!");')
      .expect('Content-Type', /javascript/)
      .end((err, res) => {
        if (err) return err;
      });
  });
  it('responds with 415 Unsupported Media Type for unsupported content types', async () => {
    request(server)
      .post('/')
      .send('<data>Unsupported</data>')
      .set('Content-Type', 'application/unsupported')
      .expect(415)
      .end((err, res) => {
        if (err) return err;
      });
  });
  // Add more tests as needed
});
