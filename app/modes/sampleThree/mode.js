'use strict';

var mode = angular.module('sos.modes.sampleThree', []);

mode.factory('modeSampleThree', function($log) {
	
	// threejs vars
	var scene, camera, render;
	
	var mode = {};
	
	/* TEXTURE WIDTH FOR SIMULATION */
	var hash = document.location.hash.substr( 1 );
	if (hash) hash = parseInt(hash, 0);	
	var WIDTH = hash || 32;

	var BIRDS = WIDTH * WIDTH;
	
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var PARTICLES = WIDTH * WIDTH;
	var BOUNDS = 800, BOUNDS_HALF = BOUNDS / 2;
	
	
	var parentScope = null;
	mode.id = "modeSampleThree";
	mode.title = "Sample Three.js engine";
	mode.renderID = null;
	
	mode.init = function($scope) {

		parentScope = $scope;
		parentScope.canvasElHidden = true;
		
		mode.renderParticles();
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
	
	mode.renderParticles = function() {
		
		var camera = new THREE.PerspectiveCamera( 75, parentScope.canvasWebGLEl.width / parentScope.canvasWebGLEl.height, 1, 3000 );
		camera.position.z = 350;

		var scene = new THREE.Scene();

		scene.fog = new THREE.Fog( 0xffffff, 100, 1000 );

		var renderer = new THREE.WebGLRenderer({canvas:parentScope.canvasWebGLEl});
		renderer.setClearColor( scene.fog.color );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		//container.appendChild( renderer.domElement );

		var simulator = new SimulationRenderer(WIDTH, renderer);
		simulator.init();

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );

		window.addEventListener( 'resize', onWindowResize, false );

		var gui = new dat.GUI();


		var effectController = {
			seperation: 20.0,
			alignment: 20.0,
			cohesion: 20.0,
			freedom: 0.75
		};

		var valuesChanger = function() {

			simulator.velocityUniforms.seperationDistance.value = effectController.seperation;
			simulator.velocityUniforms.alignmentDistance.value = effectController.alignment;
			simulator.velocityUniforms.cohesionDistance.value = effectController.cohesion;
			simulator.velocityUniforms.freedomFactor.value = effectController.freedom;

		};

		valuesChanger();


		gui.add( effectController, "seperation", 0.0, 100.0, 1.0 ).onChange( valuesChanger );
		gui.add( effectController, "alignment", 0.0, 100, 0.001 ).onChange( valuesChanger );
		gui.add( effectController, "cohesion", 0.0, 100, 0.025 ).onChange( valuesChanger );
		gui.close();

		initBirds();
	}
	
	return mode;
});