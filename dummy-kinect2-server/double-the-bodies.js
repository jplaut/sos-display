var json = require('json-file');
var _ = require('lodash');
var fs = require('fs');

var output = json.read('./skeletal-output-01.json');
var array = output.get('bodiesData')

var filename = "testfile.json";
var file = null;

var bodiesData = {};
var newArray = [];

var newIDMapping = {};

var cloneBody = function(body, offset) {
  
  var origTrackingID = body.trackingId;

  var clonedBody = _.clone(body, true);
  
  // see if new tracking id exists otherwise generate one
  var newTrackingID = newIDMapping[origTrackingID];
  if(!newTrackingID) {
    newTrackingID = _.random(0,100000);
    newIDMapping[origTrackingID] = newTrackingID;
  }
  
  clonedBody.trackingId = newTrackingID;
  
  // apply an offset to x/y
  _.forEach(clonedBody.joints, function(value,key) {
    value.x = value.x + offset;
    value.y = value.y + offset;
  });
      
  return clonedBody; 
}

// console.log("Dummy Kinect Server started.  Listening for connections.");

_.forEach(array, function(bodies,index) {
  
  var newBodies = [];
  
  _.forEach(bodies, function(body, index) {

    var b = body;
    for(var i = 0; i < 10; i++) {
      console.log("cloning body", i);
      b = cloneBody(b, 10);
      newBodies.push(b);
    }
  });
  
  newArray.push(newBodies);
});

bodiesData = { bodiesData: newArray };

var stream = fs.createWriteStream(filename);
stream.write(JSON.stringify(bodiesData));

stream.on('finish', function () {
  console.log(filename + ' written to.');
});
