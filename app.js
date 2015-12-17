var express         = require('express');
var stormpath       = require('express-stormpath');
var expressWinston  = require('express-winston');
var winston         = require('winston');
var exphbs          = require('express-handlebars');
var fs              = require('fs');

var logger          = require('./logger');
var helpers         = require('./handlebarsHelpers');

var app = express();
var router = express.Router();

var serverPort = process.env.PORT || 8000;
var privateDir = __dirname + '/private'
var staticMiddleware = express.static(privateDir);

// set up handlebars as the rendering engin
var hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: helpers
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// set the public static dir
app.use('/public', express.static(__dirname + '/public'));


// set up the logger
app.use(expressWinston.logger({
  transports: [logger],
  // meta: false,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorStatus: true
}));

app.use(router);

// set up stormpath
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


// define some paths
app.get('/', stormpath.loginRequired, function (req, res) {
    res.render('home', {user: req.user});
});

app.get('/files', stormpath.loginRequired, function(req, res) {
  res.json(fs.readdirSync(privateDir));
});

app.get('/private/:file', stormpath.loginRequired, function(req, res, next){
    req.url = req.url.replace(/^\/private/, '')
    staticMiddleware(req, res, next);
});

// start server when stormpath is ready
app.on('stormpath.ready', function () {
  app.listen(serverPort, function() {
    logger.info("Server started at port " + serverPort);
  });
});
