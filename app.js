var express         = require('express');
var stormpath       = require('express-stormpath');
var expressWinston  = require('express-winston');
var bodyParser      = require('body-parser')
var winston         = require('winston');
var exphbs          = require('express-handlebars');
var fs              = require('fs');
var _               = require('lodash');

var logger          = require('./logger');
var helpers         = require('./handlebarsHelpers');
var download        = require('./lib/downloader');

var app = express();
var router = express.Router();

var serverPort = process.env.PORT || 8000;
var ENV = process.env['NODE_ENV'];
var privateDir = __dirname + '/private';
var staticMiddleware = express.static(privateDir);

var isProd = (process.env['NODE_ENV'] === 'production');

// set up handlebars as the rendering engine
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
  meta: false,
  msg: 'HTTP {{req.method}} {{req.url}}',
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
  expand: {
    customData: true,
  },
  website: true,
  postRegistrationHandler: function (account, req, res, next) {
    logger.info('User:', account.email, 'just registered');

    // attach the files array on account create
    account.getCustomData(function(err, customData) {
      customData.files = [];
      customData.save(function(error) {
        if (error) {
          logger.error(error);
        }
      });
    });

    next();
  }
}));

var IGNORED_FILES = ['.DS_Store', '.keep']

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

function errorHandler(err, req, res, next) {
  res.status(500);
  res.json({ error: 'An Internal Error Occured.' });
};

function prodErrorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
}

function pagenotfound(req, res, next) {
  res.status(404).render('pagenotfound');
};

if (isProd) {
  app.use(prodErrorHandler);
}
else {
  app.use(errorHandler);
}

// define some paths
app.get('/', stormpath.loginRequired, function (req, res) {
    res.render('home', {user: req.user});
});

app.get('/files', stormpath.loginRequired, function(req, res) {
  var files = [];

  // get the list of all files
  var currFiles = _.pullAll(fs.readdirSync(privateDir), IGNORED_FILES);

  if (currFiles && currFiles.length > 0) {
    files = currFiles;

    // create a map of the user's files
    var userFiles = {};
    req.user.customData.files.forEach(function(file) {
      userFiles[file.fileName] = file;
    });

    // create the list of file objects
    files = files.map(function(fileName) {
      var fileObj = {fileName: fileName};
      var userFile = userFiles[fileName];

      // add extra fields if this is a user's files
      if (userFile) {
        fileObj.isUserFile = true;
        fileObj.created = userFile.created;
      }

      return fileObj;
    });
  }

  res.json({files: files});
});

app.post('/file', stormpath.loginRequired, function(req, res) {
  var url = req.body.url;
  var fileName = req.body.fileName;

  // make sure that the url was provided at least
  if (!url) {
    res.json({
      error: 'Url is required!'
    });
  }
  else {

    // start the download!
    download({
      uri: url,
      fileName: fileName,
      done: function(data) {
        data.created = new Date().getTime();

        // this is only here to attempt to save the files array again if
        // it wasn't added at account creation due to error
        if (!req.user.customData.files || !req.user.customData.files.length) {
          req.user.customData.files = [];
        }

        // push the filename onto the list of files
        req.user.customData.files.push(data);

        // save the user
        req.user.customData.save(function(e) {
          if (e) {
            res.json({error: e});
          }
          else {
            // update this property for the response
            data.isUserFile = true;
            res.json(data);
          }
        });

      },
      error: function(e) {
        res.json({
          error: e
        });
      }
    });
  }
});

app.get('/private/:file', stormpath.loginRequired, function(req, res, next){
    req.url = req.url.replace(/^\/private/, '')
    staticMiddleware(req, res, next);
});

// add at the end
app.use(pagenotfound);

// start server when stormpath is ready
app.on('stormpath.ready', function () {
  app.listen(serverPort, function() {
    logger.info('Server started at port ' + serverPort);
  });
});
