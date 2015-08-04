'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSampleThree', function($log) {
	
	// threejs vars
	var scene, camera, render, animate;
	
	var mode = {};
	
	/* TEXTURE WIDTH FOR SIMULATION */

	
/*
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var PARTICLES = WIDTH * WIDTH;
	var BOUNDS = 32, BOUNDS_HALF = BOUNDS / 2;
*/
	
	
	var parentScope = null;
	mode.id = "modeSampleThree";
	mode.title = "Sample Three.js engine";
	mode.renderID = null;
	
	mode.init = function($scope) {

		parentScope = $scope;
		parentScope.canvasElHidden = true;
		
		mode.render3DCube();
		//mode.animate();
	}
	
	mode.update = function() {
		// no updates needed for image
	}
	
	mode.deinit = function() {
		// do clean up
		cancelAnimationFrame(mode.renderID);
	}
	
		// rendering modes 
	mode.render3DCube = function() {
		
		var scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );
		
		// lights
		scene.add( new THREE.AmbientLight( 0x222222 ) );
		
		var camera = new THREE.PerspectiveCamera( 75, parentScope.canvasWebGLEl.width / parentScope.canvasWebGLEl.height, 0.1, 1000 );

		var renderer = new THREE.WebGLRenderer({canvas:parentScope.canvasWebGLEl});
/*
		renderer.setSize( canvas.width, canvas.height );
		canvas.appendChild( renderer.domElement );
*/

		var geometry = new THREE.BoxGeometry( 2, 2, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		camera.position.z = 5;

		var render = function () {
			mode.renderID = requestAnimationFrame( render );

			cube.rotation.x += 0.1;
// 			cube.rotation.y += 0.1;

			renderer.render(scene, camera);
		};

		render();
	}
	
	return mode;
});