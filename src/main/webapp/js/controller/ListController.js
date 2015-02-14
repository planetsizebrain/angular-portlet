// Define scope in this way to avoid 'Unknown provider' problem
//      https://groups.google.com/forum/#!msg/angular/_EMeX_Dci2U/xQuDwWadCrsJ
module.controller("ListCtrl", ['$scope', '$rootScope', '$http', '$timeout', 'urlFactory', 'bookmarkFactory', '$stateParams',
	function($scope, $rootScope, $http, $timeout, urlFactory, bookmarkFactory, $stateParams) {
		//$scope.id = id;
		//$scope.portletId = portletId.substr(1, portletId.length - 2);

		//$scope.page = urlFactory.create($scope.portletId, 'list');

		// Getting Liferay stuff in Javascript
		// http://www.marconapolitano.it/en/liferay/39-how-to-use-liferay-themedisplay-object-with-javascript.html
		$scope.model = {
			//currentBookmark: $stateParams.bookmark
		}

		//bookmarkFactory.getBookmarks().then(function(bookmarks) {
		//	$scope.model.bookmarks = bookmarks;
		//});

		$scope.delete = function(bookmark) {
			bookmarkFactory.deleteBookmark(bookmark).then(function(result) {
				Liferay.fire('reloadBookmarks', { portletId: $scope.portletId });
				$scope.load();
				//$scope.main();
			});
		};

		$scope.load = function() {
			$timeout(function() {
				bookmarkFactory.getBookmarks().then(function(bookmarks) {
					$scope.model.bookmarks = bookmarks;
				});
			});
		};

		Liferay.on('reloadBookmarks', function(event) {
			// Filter out event if we triggered it in this portlet instance
			if (event.portletId != $scope.portletId) {
				$scope.load();
			}
		});

		$scope.load();
}]);