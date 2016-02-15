var downloader = require('../lib/downloader');

// TODO: write actual tests
function testFileInfoGeneration() {
  var httpsUrl = 'https://images.unsplash.com/photo-1451186859696-371d9477be93?crop=entropy&fit=crop&fm=jpg&h=725&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1300';
  var httpUrl = 'http://i.imgur.com/hYvuL1Y.png';
  var invalidUrl = 'asdfasdf.jpg';


  downloader._generateFileInfo(httpsUrl, null, function(res) {
    console.log(res);
  }, function(e){ console.log(e); });

  downloader._generateFileInfo(httpUrl, null, function(res) {
    console.log(res);
  }, function(e){ console.log(e); });

  downloader._generateFileInfo(invalidUrl, null, function(res) {
    console.log(res);
  }, function(e){ console.log(e); });
}

function testFileDownload() {
  var invalidUrl = "asdfsadfsdf.jpg";
}

testFileInfoGeneration();
testFileDownload();