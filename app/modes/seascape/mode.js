'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSeascape', function($log) {

    var mode = new Mode("modeSeascape", "Seascape");
    mode.rendererType = "THREE";

    mode.preloadShaders = function() {
  	var xhrLoader = new THREE.XHRLoader();
  	xhrLoader.load(document.getElementById('genericVert').src, function(resp) {
	    mode.vertexShader = resp;
	    xhrLoader.load(document.getElementById('seascapeFrag').src, function(resp) {
	  	mode.fragmentShader = resp;
	  	mode.startRender();
  	    });
  	});
    };

    mode.init = function(parentScope) {

  	mode.setParentScope(parentScope);

  	// WebGL will throw a hissyfit if you reuse shaders/patterns
  	// from a previous canvas/context, so we need to explicitly
  	// null out everything and re-init.
	mode.vertexShader = null;
	mode.fragmentShader = null;
	mode.uniforms = null;

	mode.preloadShaders();
    };

    mode.startRender = function() {

        var camera = new THREE.PerspectiveCamera(7, mode.parentScope.threejs.renderer.domElement.width / mode.parentScope.threejs.renderer.domElement.height, 0.1, 100000);
        camera.position.z = 1;

        var scene = new THREE.Scene();

        var geometry = new THREE.PlaneBufferGeometry(2, 2);

        mode.uniforms = {
            input_resolution: { type: "v2", value: new THREE.Vector2(320.0, 192.0) },
            input_globalTime: { type: "f", value: 1.0 }
        };

        var material = new THREE.ShaderMaterial({
            uniforms: mode.uniforms,
            vertexShader: mode.vertexShader,
            fragmentShader: mode.fragmentShader
        });

        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        var render = function () {
	    mode.uniforms.input_globalTime.value += 0.05;
            mode.renderID = requestAnimationFrame(render);
            mode.parentScope.threejs.renderer.render(scene, camera);
        };

        render();
    };

    mode.deinit = function() {
        cancelAnimationFrame(mode.renderID);
    };

    return mode;
});
