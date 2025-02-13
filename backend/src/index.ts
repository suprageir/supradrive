import app from '@server';

const port = Number(process.env.PORT || 8080);
if (process.env.SSL == '1') {
  const fs = require('fs');
  const https = require('https');
  var privateKey = fs.readFileSync(process.env.SSLPRIV);
  var certificate = fs.readFileSync(process.env.SSLPUB);
  https.createServer({
    key: privateKey,
    cert: certificate
  }, app).listen(port);
  console.log("HTTPS Server is running on port " + port);
}
else {
  app.listen(port, () => {
    console.log("HTTP Server is running on port " + port);
  });
}
