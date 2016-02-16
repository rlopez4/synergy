var validUrl  = require('valid-url');
var url       = require('url');
var path      = require('path');
var fs        = require('fs');
var fileType  = require('file-type');
var Sequence  = require('sequence').Sequence;
var request   = require('request');

var logger    = require('../logger');

var MAX_FILE_SIZE = 1073741824;
var ENV = process.env['NODE_ENV'];


/**
 * Generates the file name and path to the file
 * @param  {String}   uri  the uri for the file
 * @param  {String}   name (optional) the name to name the file without the file extension
 * @param  {Function} next a callback that will contain the response
 * @param  {Function} error (optional) error callback
 * @return {Object}        contains uri, fileName and filePath properties
 */
function _generateFileInfo(uri, name, next, error) {
  var useName = ((typeof name === 'string') && name.trim());
  var baseDir = __dirname + '/../private/';
  var parsed = url.parse(uri);
  var givenExt = path.extname(parsed.pathname);
  var basename = useName ? name.trim() : path.basename(parsed.pathname, givenExt);

  // validate the url
  if (!validUrl.isWebUri(uri)) {
    error({
      message: 'Given uri is not valid.'
    });
    return;
  }

  request.get(uri)
    .on('response', function(res) {
      res.once('data', function(chunk) {

        // extract they file type
        var foundType = fileType(chunk);
        //=> {ext: 'gif', mime: 'image/gif'}

        var foundExt = (foundType) ? '.' + foundType.ext : null;

        // generate the final basename
        basename += foundExt || givenExt;

        next({
          uri: uri,
          filePath : baseDir + basename,
          fileName : basename
        });
        res.destroy();
      })
    })
    .on('error', function(e) {

      basename += givenExt;

      logger.error('downloader: ', e);

      if (error) {
        error(e);
      }

      next({
        uri: uri,
        filePath : baseDir + basename,
        fileName : basename
      });
    });
}



/**
 * Downloads a file given a url
 * @param  {String} props.uri the uri of the file
 * @param  {String} props.fileName (optional) name to give the file
 * @param  {Function} props.done called after the file is downloaded
 * @param  {Function} props.error called if an error occurs
 */
function downloadFile(props) {
  var uri = props.uri,
      fileName = props.fileName,
      done = props.done,
      error = props.error;

  // validate the url
  if (!validUrl.isWebUri(uri)) {
    error({
      message: 'Given uri is not valid.'
    });
    return;
  }

  // start a sequence chain
  var sequence = Sequence.create();
  sequence
    .then(function(next) {

      // generate the file information
      _generateFileInfo(uri, fileName, next);
    })
    .then(function(next, fileInfo) {

      // ensure that the file doesn't exist yet
      try {
        fs.statSync(fileInfo.filePath);
        error({
          message: 'File ' + fileInfo.fileName + ' already exists!'
        });
        return; // end here
      }
      catch(e) {} // we want this to happen because it means the file doesn't exist

      next(fileInfo);
    })
    .then(function(next, fileInfo) {

      // start the request for the file
      request.get(fileInfo.uri)
        .on('response', function(response) {
          next(fileInfo, response);
        })
        .on('error', function(e) {

          // exit early if an error occurs
          error(e);
          return;
        });
    })
    .then(function(next, fileInfo, response) {
      var contentLength = response.headers['content-length'];

      // all good in the hood
      if (response.statusCode === 200 && contentLength <= MAX_FILE_SIZE ) {
        var stream = fs.createWriteStream(fileInfo.filePath);

        // start wrting
        response.on('data', function(chunk) {
          stream.write(chunk);
        });

        // clean up
        response.on('end', function () {
          stream.on('close', function () {

            // completed!
            done({fileName: fileInfo.fileName});
          });
          stream.end();
        });
      }
      else {
        var errorMessage = 'Response status code other than 200 returned';

        if (contentLength > MAX_FILE_SIZE) {
          errorMessage = 'File is too large! The max file size is 1GB.'
        }

        error({
          message: errorMessage
        });
        response.destroy();
      }
    });
}

var exports = {
  downloadFile: downloadFile
};

if (ENV !== 'production') {
  exports._generateFileInfo = _generateFileInfo;
}

module.exports = exports;