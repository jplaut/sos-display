'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeDanceWildly', function($log) {

    var mode = {};
    mode.id = 'modeDanceWildly';
    mode.title = "Dance Wildly";

    var thread = undefined;
    var socket = undefined;
    var colorProcessing = false;

    var timeStep = 1/60;
    var SCALE=15;

    var world = new p2.World({
        gravity:[0, -9.82]
    });

    var box_width = 2;
    var box_height = 1;
    var init_posx = 5;
    var init_posy = 10;
    var boxBody;
    var boxShape;

    // Create an infinite ground plane.
    var groundBody = new p2.Body({
        mass: 0 // Setting mass to 0 makes the body static
    });
    var groundShape = new p2.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);
    var s = null;

    mode.init = function($scope) {

        boxBody = new p2.Body({
            mass: 1,
            position: [init_posx, init_posy],
            angularVelocity: 1
        });
        boxShape = new p2.Box({ width: box_width, height: box_height });
        boxBody.addShape(boxShape);
        world.addBody(boxBody);

        var g = new createjs.Graphics();
        g.setStrokeStyle(1);
        g.beginStroke(createjs.Graphics.getRGB(0,0,0));
        g.beginFill(createjs.Graphics.getRGB(255,0,0));
        g.drawRect(0,0,box_width*SCALE,box_height*SCALE);
        s = new createjs.Shape(g);
        s.x = init_posx*SCALE;
        s.y = init_posy*SCALE;
        $scope.stage.addChild(s);

        thread = new Worker("canvas/colorWorker.js");
        // socket = io.connect('http://localhost:8008');
        var context = $scope.stage.canvas.getContext('2d');
        thread.addEventListener("message", function (event) {
            if(event.data.message === 'imageReady') {
                context.putImageData(event.data.imageData, 0, 0);
                colorProcessing = false;
            }
        });
        thread.postMessage({
            "message": "setImageData",
            "imageData": context.createImageData($scope.stage.canvas.width, $scope.stage.canvas.height)
        });
        // socket.on('colorFrame', function(imageBuffer){
        //     if(!colorProcessing) {
	//         colorProcessing = true;
	//         thread.postMessage({ "message": "processImageData", "imageBuffer": imageBuffer });
        //     }
        // });
    }

    // TODO: skeleton?
    mode.update = function() {
        world.step(timeStep);
        s.x = boxBody.position[0]*SCALE;
        s.y = 320 - boxBody.position[1]*SCALE;
        s.rotation = boxBody.angle;

        // for each object x we track
        // render it at x.position
        //console.log(boxBody.position);
    }

    mode.deinit = function() {
	thread.terminate();
        if(socket) {
            socket.disconnect();
        }
        colorProcessing = false;
        world.removeBody(boxBody);
    }

    return mode;
});
