'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSlowClap', function($log) {
	
	var count = 0;
	var mode = new Mode("modeSlowClap", "Slow Clap");
	var loader = PIXI.loader;
	
	mode.spritesheetJSON = null;
	mode.movie = null;
	mode.filter = null;
	
	mode.init = function(parentScope) {
	
		mode.setParentScope(parentScope);
		mode.container = new PIXI.Container();
    
    if(!loader.resources.spritesheet) {
      PIXI.loader.add('spritesheet', 'media/slow-clap.json').load(mode.initAnimation);  
    } else {
      mode.initAnimation();
    }
  }
	
	mode.initAnimation = function() {
		
		// create an array of textures from an image path
		var frames = [];

    for (var i = 0; i < 7; i++) {
        var val = i < 10 ? '0' + i : i;

        // magically works since the spritesheet was loaded with the pixi loader
        var spritesheet
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
    mode.movie.animationSpeed = 0.5;
    mode.movie.play();
		mode.container.addChild(mode.movie);
		
		// set up color filter
		mode.filter = new PIXI.filters.ColorMatrixFilter();
		mode.container.filters = [mode.filter];
		
		mode.renderID = requestAnimationFrame(mode.update);	
	}
	
	mode.update = function() {
		
    var matrix = mode.filter.matrix;

    count += 0.1;
    matrix[1] = Math.sin(count) * 3;
    matrix[2] = Math.cos(count);
    matrix[3] = Math.cos(count) * 1.5;
    matrix[4] = Math.sin(count / 3) * 2;
    matrix[5] = Math.sin(count / 2);
    matrix[6] = Math.sin(count / 4);
		
		
		mode.parentScope.pixijs.renderer.render(mode.container);
		requestAnimationFrame(mode.update);			
	}

	mode.deinit = function() {
		cancelAnimationFrame(self.renderID);
	} 
	
	return mode;	
});