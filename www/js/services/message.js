'use strict';

app.factory('Message', function($firebaseArray){
	var ref = firebase.database().ref();
	var userMessageRef = ref.child('messages');

	return {
		historyMessages: function(uid1, uid2){
			var path = uid1 < uid2  ? uid1 + '/' + uid2 : uid2 + '/' + uid1;
			return $firebaseArray(userMessageRef.child(path));
		}
	}

})
