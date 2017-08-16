'use strict';

app.controller('HomeCtrl', function(Auth, $scope) {

	var home = this;

	var maxAge = null;
	var men = null;
	var women = null;

	function init() {
		home.profiles = [];

		maxAge = JSON.parse(window.localStorage.getItem('maxAge')) || 25;

		men = JSON.parse(window.localStorage.getItem('men'));
		men = men === null? true : men;

		women = JSON.parse(window.localStorage.getItem('women'));
		women = women === null? true : women;

		Auth.getProfilesByAge(maxAge).$loaded().then(function(data) {
			for (var i = 0; i < data.length; i++) {
				var item = data[i];

				if ((item.gender == 'male' && men) || (item.gender == 'female' && women)) {
					home.profiles.push(item);
				}
			}
		});
	}

	$scope.$on('$ionicView.enter', function(e) {
		init();
	})

});
