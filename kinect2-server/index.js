var Kinect2 = require('./kinect2'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    zlib = require('zlib');

var kinect = new Kinect2();
var port = 8008;

if(kinect.open()) {
    server.listen(port);
    console.log("Kinect server at " + port);

    kinect.on('bodyFrame', function(data) {
	io.sockets.emit('bodyFrame', bodies);
        io.flush();
    });

    // this is required to flush the socket properly for bodyFrame
    io.on("connection", function(socket) {
        socket.on("refresh", function(name, fn) {
            fn(name);
        });
    });

    kinect.on('colorFrame', function(data) {
	zlib.deflate(data, function(err, result){
	    if(!err) {
		io.sockets.emit('colorFrame', result.toString('base64'));
	    }
	});
    });

    kinect.on('depthFrame', function(data) {
        zlib.deflate(data, function(err, result){
            if(!err) {
        	io.sockets.emit('depthFrame', result.toString('base64'));
            }
        });
    });

    kinect.on('infraredFrame', function(data) {
        zlib.deflate(data, function(err, result){
            if(!err) {
        	io.sockets.emit('infraredFrame', result.toString('base64'));
            }
        });
    });

    kinect.on('longExposureInfraredFrame', function(data) {
        zlib.deflate(data, function(err, result){
            if(!err) {
        	io.sockets.emit('longExposureInfraredFrame', result.toString('base64'));
            }
        });
    });

    kinect.openBodyReader();
    kinect.openColorReader();
    kinect.openDepthReader();
    kinect.openInfraredReader();
    kinect.openLongExposureInfraredReader();
}
