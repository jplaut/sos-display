'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSlowClap', function($log) {
	
	var mode = new Mode("modeSlowClap", "Slow Clap");
	
	mode.jsonLoaded = false;
	mode.movie = null;
	
	mode.init = function(parentScope) {
	
		mode.setParentScope(parentScope);
		mode.container = new PIXI.Container();
	
		if(!mode.jsonLoaded) {
			PIXI.loader.add('media/slow-clap.json').load(mode.initAnimation);	
		} else {
			mode.initAnimation();
		}
	}
	
	mode.initAnimation = function() {
		
		mode.jsonLoaded = true;
		// create an array of textures from an image path
		var frames = [];

	    for (var i = 0; i < 7; i++) {
	        var val = i < 10 ? '0' + i : i;
	
	        // magically works since the spritesheet was loaded with the pixi loader
	        frames.push(PIXI.Texture.fromFrame('citizen-kane-clapping_0' + val + '.png'));
	    }
	
	
	    // create a MovieClip (brings back memories from the days of Flash, right ?)
	    mode.movie = new PIXI.extras.MovieClip(frames);
	
	    /*
	     * A MovieClip inherits all the properties of a PIXI sprite
	     * so you can change its position, its anchor, mask it, etc
	     */
	    mode.movie.position.set(0);
	    mode.movie.anchor.set(0);
	    
	    var newScale = new PIXI.Point(mode.parentScope.getWidthScaleFactor(mode.movie.width), mode.parentScope.getHeightScaleFactor(mode.movie.height));
	
	    mode.movie.scale = newScale;
	    mode.movie.animationSpeed = 2.0;
	    mode.movie.play();
		mode.container.addChild(mode.movie);
		mode.renderID = requestAnimationFrame(mode.update);	
	}
	
	mode.update = function() {
		mode.parentScope.pixijs.renderer.render(mode.container);
		requestAnimationFrame(mode.update);			
	}

	mode.deinit = function() {
		cancelAnimationFrame(self.renderID);
	} 
	
	return mode;	
});