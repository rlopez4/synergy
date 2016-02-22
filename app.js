var express         = require('express');
var stormpath       = require('express-stormpath');
var expressWinston  = require('express-winston');
var bodyParser      = require('body-parser')
var winston         = require('winston');
var exphbs          = require('express-handlebars');
var fs              = require('fs');
var path            = require('path');
var multer          = require('multer');
var mime            = require('mime');
var _               = require('lodash');

var logger          = require('./logger');
var helpers         = require('./handlebarsHelpers');
var downloader      = require('./lib/downloader');
var downloadFile   = downloader.downloadFile;

var app = express();
var router = express.Router();

/**
 *
 * Set up variables
 *
 */
var serverPort = process.env.PORT || 8000;
var ENV = process.env['NODE_ENV'];
var privateDir = __dirname + '/private';
var staticMiddleware = express.static(privateDir);
var isProd = (process.env['NODE_ENV'] === 'production');
var IGNORED_FILES = ['.DS_Store', '.keep'];
var MAX_FILE_SIZE = 1073741824;

// set up handlebars as the rendering engine
var hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: helpers
});

var storage = multer.diskStorage({
  destination: './private',
  filename: function (req, file, cb) {
    var fileExt = mime.extension(file.mimetype) || '';
    var fileName = file.originalname || '';
    var originExt = path.extname(fileName);

    fileExt = (fileExt) ? '.' + fileExt : '';

    if (req.body.fileName) {
      fileName = req.body.fileName + fileExt;
    }
    else {
      fileName = fileName.substring(0, fileName.lastIndexOf(originExt));
      fileName += fileExt;
    }

    // add the final file name to the request because that's the only way to get it
    // to the done callback

    req.finalFileName = fileName;
    cb(null, fileName);
  }
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).single('file');

/**
 *
 * Set up the aplication middleware
 *
 */

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

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/**
 *
 * Create the error handlers
 *
 */

function errorHandler(err, req, res, next) {
  res.status(500);
  res.json({ error: 'An Internal Error Occured.' });
  logger.error(err);

};

function prodErrorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.json({ error: 'An Internal Error Occured.' });
  logger.error(err);
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

/**
 *
 * Set up the paths
 *
 */
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

app.post('/userFile', stormpath.loginRequired, function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      logger.error(err);
      res.json({
        error: err
      });
      return;
    }

    var data = {
      created: new Date().getTime(),
      fileName: req.finalFileName
    };

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
        logger.error(e);
        res.json({error: e});
      }
      else {
        // update this property for the response
        data.isUserFile = true;
        res.json(data);
      }
    });
  });
});

app.post('/urlFile', stormpath.loginRequired, function(req, res) {
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
    downloadFile({
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
            logger.error(e);
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
        logger.error(e);
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

/**
 *
 * Add 404 page handler
 *
 */
// add at the end
app.use(pagenotfound);

/**
 *
 * Start server
 *
 */
// start server when stormpath is ready
app.on('stormpath.ready', function () {
  app.listen(serverPort, function() {
    logger.info('Server started at port ' + serverPort);
  });
});
