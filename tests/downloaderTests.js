var downloader = require('../lib/downloader');

var AFTER_STRING = '*'.repeat(50) + '\n';

var logSuccess = function(res, url) {
  console.log('Download info for ' + url);
  console.log(res);
  console.log(AFTER_STRING)
}

var logError = function(err, url) {
  console.log('Error info for ' + url);
  console.log(err);
  console.log(AFTER_STRING)
}

// TODO: write actual tests
function testFileInfoGeneration() {
  var httpsUrl = 'https://images.unsplash.com/photo-1445299370299-fba06c02df22?crop=entropy&fit=crop&fm=jpg&h=725&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1300';
  var httpUrl = 'http://i.imgur.com/hYvuL1Y.png';
  var invalidUrl = 'asdfasdf.jpg';

  downloader._generateFileInfo(httpsUrl, null, function(res) {
    logSuccess(res, httpsUrl);
  }, function(e){ logError(e, httpsUrl); });

  downloader._generateFileInfo(httpUrl, null, function(res) {
    logSuccess(res, httpUrl);
  }, function(e){ logError(e, httpUrl); });

  downloader._generateFileInfo(invalidUrl, null, function(res) {
    logSuccess(res, invalidUrl)
  }, function(e){ logError(e, invalidUrl); });
}

function testFileDownload() {
  var httpsUrl = 'https://images.unsplash.com/photo-1451186859696-371d9477be93?crop=entropy&fit=crop&fm=jpg&h=725&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1300';
  var httpUrl = 'http://i.imgur.com/hYvuL1Y.png';
  var invalidUrl = 'asdfasdf.jpg';

  downloader.downloadFile({
    uri: httpsUrl,
    name: null,
    done: function(res){
      logSuccess(res, httpsUrl);
    },
    error: function(err) {
      logError(err, httpsUrl);
    }
  });

  downloader.downloadFile({
    uri: httpUrl,
    name: null,
    done: function(res){
      logSuccess(res, httpUrl);
    },
    error: function(err) {
      logError(err, httpUrl);
    }
  });

  downloader.downloadFile({
    uri: invalidUrl,
    name: null,
    done: function(res){
      logSuccess(res, invalidUrl);
    },
    error: function(err) {
      logError(err, invalidUrl);
    }
  });
}

testFileInfoGeneration();
// testFileDownload();

