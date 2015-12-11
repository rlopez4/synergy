var express = require('express');
var stormpath = require('express-stormpath');
var expressWinston = require('express-winston');
var winston = require('winston');
var logger = require('./logger');

var app = express();
var router = express.Router();

var serverPort = process.env.PORT || 8000;

app.use(expressWinston.logger({
  transports: [logger],
  meta: false,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorStatus: true
}));

app.use(router); // notice how the router goes after the logger.

app.use(stormpath.init(app, {
  client: {
    apiKey: {
      id: process.env['STORMPATH_CLIENT_APIKEY_ID'],
      secret: process.env['STORMPATH_CLIENT_APIKEY_SECRET'],
    }
  },
  application: {
    href: process.env['STORMPATH_APPLICATION_HREF']
  },
  website: true
}));


app.on('stormpath.ready', function () {
  app.listen(serverPort, function() {
    logger.info("Server started at port " + serverPort);
  });
});