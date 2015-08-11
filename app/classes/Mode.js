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
	
	this.setParentScope = function(scope) {
		self.parentScope = scope;
	}	
}