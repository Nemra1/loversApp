'use strict';

app.factory('Auth', function($firebaseAuth, $firebaseObject, $state, $http, $q, $firebaseArray) {
	var ref = firebase.database().ref();
	var auth = $firebaseAuth();

	var Auth = {

		createProfile: function(uid, profile) {
			return ref.child('profiles').child(uid).set(profile);
		},

		getProfile: function(uid) {
			return $firebaseObject(ref.child('profiles').child(uid));
		},

		login: function() {
			var provider = new firebase.auth.FacebookAuthProvider();
			provider.addScope('public_profile, email, user_location, user_birthday, user_photos, user_about_me');

			return auth.$signInWithPopup(provider)
			.then(function(result) {
				var accessToken = result.credential.accessToken;
				var user = Auth.getProfile(result.user.uid).$loaded();

				user.then(function(profile) {
					if (profile.name == undefined) {

						var genderPromise = $http.get('https://graph.facebook.com/me?fields=gender&access_token=' + accessToken);
						var birthdayPromise = $http.get('https://graph.facebook.com/me?fields=birthday&access_token=' + accessToken);
						var locationPromise = $http.get('https://graph.facebook.com/me?fields=location&access_token=' + accessToken);
						var bioPromise = $http.get('https://graph.facebook.com/me?fields=about&access_token=' + accessToken);
						var imagesPromise = $http.get('https://graph.facebook.com/me/photos/uploaded?fields=source&access_token=' + accessToken);
						var promises = [genderPromise, birthdayPromise, locationPromise, bioPromise, imagesPromise];

						$q.all(promises).then(function(data) {
							var info = result.user.providerData[0];
							var profile = {
								name: info.displayName,
								email: info.email,
								avatar: info.photoURL,
								gender: data[0].data.gender ? data[0].data.gender : "",
								birthday: data[1].data.birthday ? data[1].data.birthday : "",
								age: data[1].data.birthday ? Auth.getAge(data[1].data.birthday) : "",
								location: data[2].data.location ?  data[2].data.location.name : "",
								bio: data[3].data.about ? data[3].data.about : "",
								images: data[4].data.data
							}
							Auth.createProfile(result.user.uid, profile);
						});
					}
				});
			});
		},

		logout: function() {
			return auth.$signOut();
		},

		getAge: function(birthday) {
			return new Date().getFullYear() - new Date(birthday).getFullYear();
		},

		requireAuth: function() {
			return auth.$requireSignIn();
		},

		getProfiles: function() {
			return $firebaseArray(ref.child('profiles'));
		},

		getProfilesByAge: function(age) {
			return $firebaseArray(ref.child('profiles').orderByChild('age').startAt(18).endAt(age));
		}

	};

	auth.$onAuthStateChanged(function(authData) {
		if(authData) {
			console.log('Logged in!');
		} else {
			$state.go('login');
			console.log('You need to login.');
		}
	});

	return Auth;

});
