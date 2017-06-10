var app = angular.module('app', ['ngRoute']);

const {remote} = require('electron');

app.service('image', function() {
	var imagePath = "";
	var dimesions = [];
	this.setImagePath = function(path) {
		imagePath = path;
	};
	this.getImagePath = function() {
		return imagePath;
	};
	this.setImageDimensions = function(imgDimesions) {
		dimesions = imgDimesions;
	};
	this.getImageDimensions = function() {
		return dimesions;
	};
});

app.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: `${__dirname}/components/home/home.html`,
		controller: 'homeCtrl'
	}).when('/edit', {
		templateUrl: `${__dirname}/components/editImage/editImage.html`,
		controller: 'editCtrl'
	}).otherwise({
		template: '404 bro'
	});
});

app.controller('headCtrl', function($scope) {
	var win = remote.getCurrentWindow();

	$scope.close = function() {
		win.close();
	};
	$scope.maximize = function() {
		win.isMaximized() ? win.unmaximize() : win.maximize();
	};
	$scope.minimize = function() {
		win.minimize();
	}
});

app.controller('homeCtrl', function($scope, $location, image) {
	$scope.pickFile = function() {
		var {dialog} = remote;
		dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [{
				name: 'Images',
				extensions: ['jpg', 'jpeg', 'png']
			}]
		}, function(file) {
			if(!!file) {
				var path = file[0];
				image.setImagePath(path);
				var sizeof = require('image-size');

				var dimesions = sizeof(path); // dimesions.width and dimesions.height

				image.setImageDimensions(dimesions);
				$location.path('/edit');
				$scope.$apply();
			}
		});
	};
});

app.controller('editCtrl', function($scope, image, $location) {
	$scope.imagePath = image.getImagePath();

	$scope.controlsActive = false;

	var imageReference = document.getElementById('mainImage');

	var generatedStyles = "";

	$scope.effects = {
		'Brightness': {val: 100, min: 0, max:200, delim: '%'}, 
		'Contrast': {val: 100, min: 0, max:200, delim: '%'}, 
		'Invert': {val: 0, min: 0, max:100, delim: '%'}, 
		'Hue-Rotate': {val: 0, min: 0, max:360, delim: 'deg'}, 
		'Sepia': {val: 0, min: 0, max:100, delim: '%'}, 
		'Grayscale': {val: 0, min: 0, max:100, delim: '%'}, 
		'Saturate': {val: 100, min: 0, max:200, delim: '%'}, 
		'Blur': {val: 0, min: 0, max:5, delim: 'px'}
	};
	
	$scope.imageEffect = function(effectName) {
		$scope.controlsActive = true;
		$scope.activeEffect = effectName;
		console.log(effectName);
	};

	$scope.setEffect = function() {
		generatedStyles = "";
		for(let i in $scope.effects) { // i = Brightness and $scope.effects[i].val
			generatedStyles += `${i}(${$scope.effects[i].val+$scope.effects[i].delim}) `;
		}
		imageReference.style.filter = generatedStyles;
		console.log(generatedStyles);
	}

	$scope.hideThis = function() {
		$scope.controlsActive = false;
	};

	$scope.change = function() {
		$location.path('/');
	}

	$scope.save = function() {
		// the magic goes
		const {BrowserWindow} = remote;
		var dimesions = image.getImageDimensions();
		let src = image.getImagePath();

		let styles = imageReference.style.filter;

		let win = new BrowserWindow({
			frame: false,
			show: false,
			width: dimesions.width,
			height: dimesions.height,
			webPreferences: {
				webSecurity: false
			}
		});

		win.loadURL(`data:text/html,
			<style>*{margin:0;padding:0;}</style><img src="${src}" style="filter: ${styles}">
			
			<script>
				var screenshot = require('electron-screenshot');
				screenshot({
					filename: 'userFile.png',
					delay: 1000
				});
			</script>
		
			`);

	};

});