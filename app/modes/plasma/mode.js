'use strict';

var mode = angular.module('sos.modes.plasma', []);

mode.factory('modePlasma', function($log) {
	
	var mode = {};
	mode.id = "modePlasma";
	mode.title = "Plasma Effect";	
	
	var width, height, roughness, plasmaType, canvas, ctx, totalSize, points;
	
	var types = { PLASMA: 0, CLOUD: 1 };
	
	mode.colorModif = [255, 255, 255];	
	
	mode.init = function($scope) {
		// init method

		$scope.stage.autoClear = false;

		width = $scope.stage.canvas.width;
		height = $scope.stage.canvas.height;

		console.log("width/height is:", width, height);

		//initialize local variables
		roughness = 2;
		plasmaType = types.PLASMA;

		//generate points
		points = mode.getPoints(width, height, roughness);

		//draw points
		//mode.draw($scope.stage);	
	}
	
	mode.update = function($scope) {
		// no updates needed for image
		//mode.draw();
	}
	
	mode.deinit = function($scope) {
		// do clean up
	}
	
	mode.draw = function(stage)
	{
		for (var x = 0; x < width; x++)
		{
			for (var y = 0; y < height; y++)
			{
				//get color for each pixel
				var color = this.getColor(points[x][y], plasmaType);
				var fillStyle = "rgba("+color.r+","+color.g+","+color.b+",1.0)";
				var pixel = new createjs.Shape();
				pixel.graphics.beginFill(fillStyle).drawRect(x,y,1,1);
				stage.addChild(pixel);
			}
		}
	}	
	
	mode.getPoints = function(width, height, rough)  
	{  
		var p1, p2, p3, p4;  
		var points = [];
		for (var x = 0; x < width; x++)
		{
			points[x] = [];
		}
		//give corners random colors
		p1 = Math.random();
		p2 = Math.random();
		p3 = Math.random();
		p4 = Math.random();
		roughness = rough;
		totalSize = width + height;
		mode.splitRect(points, 0, 0, width, height, p1, p2, p3, p4);
		return points;
	}

	mode.splitRect = function(points, x, y, width, height, p1, p2, p3, p4)
	{  
		var side1, side2, side3, side4, center;
		var transWidth = ~~(width / 2);
		var transHeight = ~~(height / 2);
		
		//as long as square is bigger then a pixel..
		if (width > 1 || height > 1)
		{  
			//center is just an average of all 4 corners
			center = ((p1 + p2 + p3 + p4) / 4);
			
			//randomly shift the middle point 
			center += mode.shift(transWidth + transHeight);
			
			//sides are averages of the connected corners
			//p1----p2
			//|     |
			//p4----p3
			side1 = ((p1 + p2) / 2);
			side2 = ((p2 + p3) / 2);
			side3 = ((p3 + p4) / 2);
			side4 = ((p4 + p1) / 2);
			
			//its possible that middle point was moved out of bounds so correct it here
			center = mode.normalize(center);
			side1 = mode.normalize(side1);
			side2 = mode.normalize(side2);
			side3 = mode.normalize(side3);
			side4 = mode.normalize(side4);
			
			//repear operation for each of 4 new squares created
			//recursion, baby!
			mode.splitRect(points, x, y, transWidth, transHeight, p1, side1, center, side4);
			mode.splitRect(points, x + transWidth, y, width - transWidth, transHeight, side1, p2, side2, center);
			mode.splitRect(points, x + transWidth, y + transHeight, width - transWidth, height - transHeight, center, side2, p3, side3);
			mode.splitRect(points, x, y + transHeight, transWidth, height - transHeight, side4, center, side3, p4);
		}
		else 
		{
			//when last square is just a pixel, simply average it from the corners
			points[x][y]= (p1 + p2 + p3 + p4) / 4;
		}
	}

	mode.normalize = function(val)  
	{  
		return (val < 0) ? 0 : (val > 1) ? 1 : val;
	}
  
	mode.shift = function(smallSize)
	{ 
		return (Math.random() - 0.5) * smallSize / totalSize * roughness;
	}
	
	mode.getColor = function(c, type)
	{
		var red = 0, green = 0, blue = 0;
	
		switch (type)
		{
			case types.CLOUD:
				if (c < 0.3)
					red = c;
				red = green = c;

				blue = 1;
				break;
			case types.PLASMA:
				//r
				if (c < 0.5)
					red = c * 2;
				else
					red = (1.0 - c) * 2;

				//g
				if (c >= 0.3 && c < 0.8)
					green = (c - 0.3) * 2;
				else if (c < 0.3)
					green = (0.3 - c) * 2;
				else
					green = (1.3 - c) * 2;

				//b
				if (c >= 0.5)
					blue = (c - 0.5) * 2;
				else
					blue = (0.5 - c) * 2;
				break;
			default:
				red = green = blue = c;
				break;
		}
		return {
			r: ~~(red * mode.colorModif[0]),
			g: ~~(green * mode.colorModif[1]),
			b: ~~(blue * mode.colorModif[2])
		};
	}	
	
	return mode;
});