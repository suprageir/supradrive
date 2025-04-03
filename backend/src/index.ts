import app from '@server';

const port = Number(process.env.PORT || 8080);
if (process.env.SSL == '1') {
  const fs = require('fs');
  const https = require('https');
  var privateKey = fs.readFileSync(process.env.SSLPRIV);
  var certificate = fs.readFileSync(process.env.SSLPUB);
  const server = https.createServer({
    key: privateKey,
    cert: certificate
  }, app).listen(port);
  server.timeout = 0;
  console.log("HTTPS Server is running on port " + port);
}
else {
  const server = app.listen(port, () => {
    console.log("HTTP Server is running on port " + port);
  });
  server.timeout = 0;
  server.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        console.error('Port ' + port + ' requires elevated privileges');
        process.exit(1);
      case 'EADDRINUSE':
        console.error('Port ' + port + ' is already in use');
        process.exit(1);
      default:
        throw error;
    }
  });
}

