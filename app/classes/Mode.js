var Mode = function(id, title) {

	// get reference to self
	var self = this;

	// class properties
	this.id = id;
	this.title = title;
	this.parentScope = null;
	this.container = null;
	this.renderID = null;
	this.rendererType = "PIXI";

	this.setParentScope = function(scope) {
		self.parentScope = scope;
	};
};

var ShaderMode = function(args) {

	// get reference to self
	var self = this;

	// class properties
	this.id = args.id;
	this.title = args.title;
	this.parentScope = null;
	this.container = null;
	this.renderID = null;
        this.rendererType = 'THREE';

        var uniformExtras = null;

        this.init = function(parentScope) {

		self.parentScope = parentScope;

  	        // WebGL will throw a hissyfit if you reuse shaders/patterns
  	        // from a previous canvas/context, so we need to explicitly
  	        // null out everything and re-init.
	        self.vertexShader = null;
	        self.fragmentShader = null;
	        self.uniforms = null;

                // optionally load extra stuff that the shader needs.
                if(args.loadUniforms) {
                        uniformExtras = args.loadUniforms();
                }

  	        var xhrLoader = new THREE.XHRLoader();
  	        xhrLoader.load(document.getElementById('genericVert').src, function(resp) {
	                self.vertexShader = resp;
	                xhrLoader.load(document.getElementById(args.pixelShaderName).src, function(resp) {
	  	                self.fragmentShader = resp;
	  	                self.startRender();
  	                });
  	        });
        };

        this.startRender = function() {

                var camera = new THREE.PerspectiveCamera(7, self.parentScope.threejs.renderer.domElement.width / self.parentScope.threejs.renderer.domElement.height, 0.1, 100000);
                camera.position.z = 1;

                var scene = new THREE.Scene();

                var geometry = new THREE.PlaneBufferGeometry(2, 2);

                self.uniforms = {
                        input_resolution: { type: "v2", value: new THREE.Vector2(192.0, 320.0) },
                        input_globalTime: { type: "f", value: 0.0 }
                };

                // merge, and optionally override.
                if(uniformExtras) {
                        for(var attr in uniformExtras) {
                                self.uniforms[attr] = uniformExtras[attr];
                        }
                }

                var material = new THREE.ShaderMaterial({
                        uniforms: self.uniforms,
                        vertexShader: self.vertexShader,
                        fragmentShader: self.fragmentShader
                });

                var mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                var render = function () {
                        if(args.render) {
                                args.render();
                        }
	                self.uniforms.input_globalTime.value += 0.05;
                        self.renderID = requestAnimationFrame(render);
                        self.parentScope.threejs.renderer.render(scene, camera);
                };

                render();
        };

        this.deinit = function() {
                cancelAnimationFrame(self.renderID);
        };
};
