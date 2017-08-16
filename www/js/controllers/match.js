'use strict';

app.controller('MatchCtrl', function(Match, Auth, uid, $scope, Like, $ionicModal, profile, Message, $ionicScrollDelegate, $timeout) {

	var match = this;

	match.currentUser = profile;
	match.message = '';
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

	function init() {

		match.list = [];

		Match.allMatchesByUser(uid).$loaded().then(function(data) {
			for (var i = 0; i < data.length; i++) {
				var item = data[i];

				Auth.getProfile(item.$id).$loaded().then(function(profile) {
					match.list.push(profile);
				});
			}
		});
	};

	$scope.$on('$ionicView.enter', function(e) {
		init();
	});

	match.unmatch = function(matchUid) {
		Like.removeLike(uid, matchUid);
		Match.removeMatch(uid, matchUid);

		init();
	};

	$ionicModal.fromTemplateUrl('templates/message.html',{
		scope: $scope
	})
	.then(function(modal){
		$scope.modal = modal;
	})

	match.openMessageModal = function(matchUid){
		Auth.getProfile(matchUid).$loaded()
		.then(function(profile){
			match.currentMatchUser = profile;
			Message.historyMessages(matchUid, uid).$loaded()
			.then(function(data){
				match.messages = data;
				$scope.modal.show();
				$timeout(function() {
					viewScroll.scrollBottom();
				}, 0);
			})
		})
	};

	match.closeMessageModal = function(){
		$scope.modal.hide();
	};

	match.sendMessage = function(){

		if(match.message.length > 0 ){

			match.messages.$add({
				uid: match.currentUser.$id,
				body: match.message,
				timestamp: firebase.database.ServerValue.TIMESTAMP

			}).then(function(){
				match.message = '';
				$timeout(function() {
					viewScroll.scrollBottom();
				}, 0);
			})
		}
	};

})
