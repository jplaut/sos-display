var Mode = function(id, title) {
	
	// get reference to self
	var self = this;
	
	// class properties
	this.id = id;
	this.title = title;
	this.parentScope = null;
	this.container = null;
	this.renderID;
	this.rendererType = "PIXI";
	
	this.update = function() {
		
		if(self.rendererType == "PIXI") {
			self.parentScope.renderer.render(self.container);
			requestAnimationFrame(self.update);			
		}

	}
	
	this.deinit = function() {

		// do clean up
		cancelAnimationFrame(self.renderID);
	}
	
	this.setParentScope = function(scope) {
		self.parentScope = scope;
	}	
}