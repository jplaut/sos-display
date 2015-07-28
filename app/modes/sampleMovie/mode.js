			{ name: "Play movie.", fn: function() {

				var vidEl = document.createElement('video');
				vidEl.src = "media/small.mp4";

				vidEl.oncanplaythrough = function() {

					var video = new createjs.Bitmap(vidEl);

					// figure out scale
// 					var bounds = video.nominalBounds;
					console.log("video width and height is: ", video.image.videoWidth, video.image.videoHeight);

					video.scaleX = $scope.getWidthScaleFactor(video.image.videoWidth);
					video.scaleY = $scope.getHeightScaleFactor(video.image.videoHeight);
					$scope.stage.addChild(video);
					vidEl.play();