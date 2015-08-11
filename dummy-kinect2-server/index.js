var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(8008);
var json = require('json-file');
var _ = require('lodash');

var output = json.read('./skeletal-output-02.json');
var array = output.get('bodiesData')

console.log("Dummy Kinect Server started.  Listening for connections.");

io.on('connection', function(socket){
	console.log("Received connection.");
	var counter = 0;
	var arraySize = array.length;

	setInterval(function() {
		socket.emit("bodyFrame", array[counter]);

		counter++;
		if(counter >= array.length) {
			counter = 0;
		}
	}, 33);
});


io.on('disconnect', function(socket) {
	console.log("Disconnected from client.");
})