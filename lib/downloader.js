var validUrl = require('valid-url');
var url = require('url');
var path = require('path');
var fs = require('fs');
var http = require('http');

function _generateFilePath(uri, name) {
  var useName = ((typeof name === 'string') && name.trim());
  var baseDir = __dirname + '/../private/';
  var parsed = url.parse(uri);
  var givenExt = path.extname(parsed.pathname);
  var basename = useName ? name.trim() : path.basename(parsed.pathname);

  if (useName) {
    basename += givenExt;
  }
  var response = {
    filePath : baseDir + basename,
    fileName : basename
  };

  return response;
}

/**
 * Downloads a file given a url
 * @param  {[type]} props [description]
 * @return {[type]}       [description]
 */
function download(props) {
  var uri = props.uri,
      fileName = props.fileName,
      done = props.done,
      error = props.error;

  if (!validUrl.isUri(uri)) {
    console.log('Given uri is not valid. Offender:' , uri);
  }

  var fileResp = _generateFilePath(uri, fileName);
  var filePath = fileResp.filePath;
  fileName = fileResp.fileName;

  try {
    fs.statSync(filePath);
    error({
      message: 'File ' + fileName + ' already exists!'
    });
    return;
  }
  catch (e) {
    // this is actually a good thing
  }
  var stream = fs.createWriteStream(filePath);

  http.get(uri, function(response) {

    // all good in the hood
    if (response.statusCode === 200) {
      response.on('data', function(chunk) {
        stream.write(chunk);
      })
    }
    else {
      if (typeof error === 'function') {
        error({
          message: 'Response status code other than 200 returned'
        });
      }
    }
    response.on('end', function () {
      stream.on('close', function () {
        if (typeof done === 'function') {
          done({fileName: fileName});
        }
      });
      stream.end();
    });
  }).on('error', function(e) {
    if (typeof error === 'function') {
      error(e);
    }
  });
}

module.exports = download;