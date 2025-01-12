const express = require('express');
const next = require('next');
const https = require('https');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Use HTTPS with self-signed certificates
  const options = {
    key: fs.readFileSync('c:/ssl/localhost.key'),
    cert: fs.readFileSync('c:/ssl/localhost.pem'),
  };

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  https
    .createServer(options, server)
    .listen(443, (err) => {
      if (err) throw err;
      console.log('> Ready on https://localhost:443');
    });
});