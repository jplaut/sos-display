var Kinect2 = require('../kinect2-server/kinect2');
var json = require('json-file');
var fs = require('fs');

var kinect = new Kinect2();
var filename = process.argv[2];
var data = [];
var length = 30; // seconds
var file = null;

console.log("Warning: this script generates very large files.");
var stream = fs.createWriteStream(filename);
if(kinect.open()) {
    console.log('Kinect opened, will record to ' + filename + ' for ' + length + ' seconds.');

    kinect.on('bodyFrame', function(x) { stream.write(JSON.stringify({'bodyFrame': x})); });
    kinect.on('colorFrame', function(x) { stream.write('{"colorFrame":"' + x + '"}'); });
    kinect.on('depthFrame', function(x) { stream.write('{"depthFrame":"' + x + '"}'); });
    kinect.on('infraredFrame', function(x) { stream.write('{"infraredFrame":"' + x + '"}'); });
    kinect.on('longExposureInfraredFrame', function(x) { stream.write('{"longExposureInfraredFrame":"' + x + '"}'); });

    kinect.openBodyReader();
    kinect.openColorReader();
    kinect.openDepthReader();
    kinect.openInfraredReader();
    kinect.openLongExposureInfraredReader();
}

stream.on('finish', function () {
  console.log(filename + ' written to.');
});

//close the kinect after 5 seconds
setTimeout(function(){
    console.log("Time's up!");
    stream.end();
    console.log('Bye! If the program hangs after this, it is safe to interrupt -- hit Control-C.');
    kinect.close();
}, length*1000);
