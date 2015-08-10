'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSampleThree', function($log) {
	
		
	var mode = new Mode("modeSampleThree", "Sample Three.js Engine");
	mode.rendererType = "THREE";

	mode.init = function(parentScope) {

		this.setParentScope(parentScope);		
		mode.render3DCube();
	}
	
	// rendering modes 
	mode.render3DCube = function() {
		
		var scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );
		
		// lights
		scene.add( new THREE.AmbientLight( 0x222222 ) );
		
		var camera = new THREE.PerspectiveCamera( 75, mode.parentScope.threejs.renderer.domElement.width / mode.parentScope.threejs.renderer.domElement.height, 0.1, 1000 );

		var geometry = new THREE.BoxGeometry( 2, 2, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		camera.position.z = 5;

		var render = function () {
			mode.renderID = requestAnimationFrame( render );

			cube.rotation.x += 0.1;
			cube.rotation.y += 0.1;

			mode.parentScope.threejs.renderer.render(scene, camera);
		};

		render();
	}
	
	mode.deinit = function() {
		console.log("cancelling animation", mode.renderID);
    	cancelAnimationFrame(mode.renderID);
  	}	
	
	return mode;
});