	$scope.midiKeyboard = function() {

		MIDI.loadPlugin({
    	instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    	onsuccess: function() { }
		});

		var socket = io.connect('http://localhost:1337');
		socket.on('message', function(data){
			console.log(data);

	    var note = data.note;

			var shape = new createjs.Shape();
			var colorMap = MIDI.Synesthesia.map();
			var map = colorMap[note];

			shape.graphics.beginFill(map.hex).drawRect(0, 0, 192, 320);
			MIDI.noteOn(0, note, 100, 0);
			$scope.stage.addChild(shape);

			socket.emit('launchpad-key-color', [note, map.hex]);
		});


    //Create a Shape DisplayObject.
    var circle = new createjs.Shape();
    circle.graphics.beginFill("green").drawCircle(0, 0, 40);
    //Set position of Shape instance.
    circle.x = circle.y = 50;
    //Add Shape instance to stage display list.
    $scope.stage.addChild(circle);
	}