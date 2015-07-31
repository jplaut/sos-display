'use strict';

var mode = angular.module('sos.modes.truchet', []);

mode.factory('modeTruchet', function($log) {

  var mode = {};
  mode.id = "modeTruchet";
  mode.title = "Truchet";

  var camera, scene, renderer, uniforms;
  var vertexShader, fragmentShader = null;

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if(xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200){
      vertexShader = xmlhttp.responseText;
    }
  };
  xmlhttp.open("GET", document.getElementById('truchetVert').src, true);
  xmlhttp.send();

  xmlhttp.onreadystatechange = function() {
    if(xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200){
      fragmentShader = xmlhttp.responseText;
    }
  };
  xmlhttp.open("GET", document.getElementById('truchetFrag').src, true);
  xmlhttp.send();

  mode.init = function($scope) {

    $scope.canvasElHidden = true;

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    uniforms = {
      // yes, the resolution given is not correct. this is because the
      // original shader code has a bug in it when y-res < x-res.
      input_resolution: { type: "v2", value: new THREE.Vector2(320.0, 480.0) },
      input_globalTime: { type: "f", value: 1.0 }
      //input_channel0: null,//TODO -- cubemap
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ canvas: $scope.canvasWebGLEl });

    var render = function () {
      mode.renderID = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };

    render();
  }

  mode.update = function($scope) {
    uniforms.input_globalTime.value += 0.05;
  }

  mode.deinit = function($scope) {
    cancelAnimationFrame(mode.renderID);
  }

  return mode;
});
