module.controller('DetailCtrl', ['$scope', '$rootScope', 'bookmarkFactory', '$state', '$stateParams',
	function ($scope, $rootScope, bookmarkFactory, $state, $stateParams) {

		console.log("Show detail for bookmark: " + $stateParams.bookmark.entryId);

		// Getting Liferay stuff in Javascript
		// http://www.marconapolitano.it/en/liferay/39-how-to-use-liferay-themedisplay-object-with-javascript.html
		$scope.model = {
			currentBookmark: $stateParams.bookmark
		};

		$scope.save = function() {
			bookmarkFactory.saveBookmark($scope.model.currentBookmark).then(function(result) {
				Liferay.fire('reloadBookmarks', { portletId: $scope.portletId });
				$state.go('list');
			});
		}
}]);