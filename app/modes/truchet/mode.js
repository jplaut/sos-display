'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeTruchet', function($log) {

	var mode = new Mode("modeTruchet", "Truchet");
	mode.rendererType = "THREE";
                                               
  mode.preloadShaders = function() {

  	console.log("preloading shaders");

  	// XHR loader
  	var xhrLoader = new THREE.XHRLoader();
  	xhrLoader.load(document.getElementById('truchetVert').src, function(resp) {
	  	mode.vertexShader = resp;
	  	xhrLoader.load(document.getElementById('truchetFrag').src, function(resp) {
	  		mode.fragmentShader = resp;	
	  		mode.startRender();
  		});
  	});
  	
	// pre-load images.
	mode.cube = THREE.ImageUtils.loadTextureCube(['media/cube00.png',
	                                               'media/cube01.png',
	                                               'media/cube02.png',
	                                               'media/cube03.png',
	                                               'media/cube04.png',
	                                               'media/cube05.png']);
  }                                             

  mode.init = function(parentScope) {

  	mode.setParentScope(parentScope);

  	// WebGL will throw a hissyfit if you reuse shaders/patterns from a previous canvas/context, 
  	// so we need to explictly null out everything and re-init.
	mode.vertexShader = null;
	mode.fragmentShader = null;
	mode.cube = null;
	mode.uniforms = null;

	mode.preloadShaders();
  }

  mode.startRender = function() {
	  
    var camera = new THREE.PerspectiveCamera( 7, mode.parentScope.threejs.renderer.domElement.width / mode.parentScope.threejs.renderer.domElement.height, 0.1, 100000 );
    camera.position.z = 1;

    var scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    mode.uniforms = {
      // yes, the resolution given is not correct. this is because the
      // original shader code has a bug in it when y-res < x-res.
      input_resolution: { type: "v2", value: new THREE.Vector2(320.0, 480.0) },
      input_globalTime: { type: "f", value: 1.0 },
      input_channel0: { type: "t", value: mode.cube },
    };

    var material = new THREE.ShaderMaterial({
      uniforms: mode.uniforms,
      vertexShader: mode.vertexShader,
      fragmentShader: mode.fragmentShader,
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    var render = function () {
	  mode.uniforms.input_globalTime.value += 0.05;
      mode.renderID = requestAnimationFrame(render);
      mode.parentScope.threejs.renderer.render(scene, camera);
    };

    render();	  
  }

  mode.deinit = function() {
    cancelAnimationFrame(mode.renderID);
  }

  return mode;
});
