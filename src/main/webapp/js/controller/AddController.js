'use strict';

var module = angular.module('app.controllers', []);

module.controller('AddCtrl', ['$scope', '$rootScope', 'bookmarkFactory', '$state', '$stateParams',
	function ($scope, $rootScope, bookmarkFactory, $state, $stateParams) {

		console.log("Add new bookmark...");

		$scope.model = {
			currentBookmark: {}
		};

		$scope.store = function() {
			bookmarkFactory.addBookmark($scope.model.currentBookmark).then(function(result) {
				console.log("Added new bookmark: " + $scope.model.currentBookmark.name);

				Liferay.fire('reloadBookmarks', { portletId: $scope.portletId });
				$state.go('list');
			});
		};
}]);