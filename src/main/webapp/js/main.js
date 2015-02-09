'use strict';

function bootstrap(id, portletId) {

	var module = angular.module(id, ["ui.router", "app.factories", "app.controllers", "pascalprecht.translate"]);

	module.config(['$translateProvider', function ($translateProvider) {
		var url = Liferay.PortletURL.createResourceURL();
		// Need to set both for request to work
		// resourceId can be used to check and distinguish on server side
		url.setResourceId('language');
		url.setPortletId(portletId.substr(1, portletId.length - 2));
		url.setParameter('locale', Liferay.ThemeDisplay.getBCP47LanguageId());

		$translateProvider.useUrlLoader(url.toString());
		$translateProvider.preferredLanguage(Liferay.ThemeDisplay.getBCP47LanguageId());
		// TODO: fails for some strange reason?
		//$translateProvider.useLocalStorage();
	}]);

	// TODO: convert bottom bar to directive?
	// http://fdietz.github.io/recipes-with-angular-js/directives/passing-configuration-params-using-html-attributes.html
	//module.directive('i18n', function() {
	//	return {
	//		restrict: 'A',
	//		link: function(scope, element, attributes) {
	//			var message = Liferay.Language.get(attributes["i18n"]);
	//			element.html(message);
	//		}
	//	}
	//});

	module.run(['$rootScope', 'releaseFactory', function ($rootScope, releaseFactory) {
		$rootScope.portletId = portletId.substr(1, portletId.length - 2);

		$rootScope.liferay = {
			token: Liferay.authToken,
			companyId: Liferay.ThemeDisplay.getCompanyId(),
			loggedIn: Liferay.ThemeDisplay.isSignedIn()
		}

		releaseFactory.getRelease($rootScope.portletId).then(function(release) {
			$rootScope.liferay.release = release;
		});
	}]);

	module.config(['$urlRouterProvider', '$stateProvider', '$locationProvider', 'urlProvider',
			function($urlRouterProvider, $stateProvider, $locationProvider, urlProvider) {

		urlProvider.setPid(portletId);

		// No # when routing!
		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('/');

		// TODO: change templateprovider url on routechangestart
		$stateProvider
			.state("list", {
				url: '/',
				templateProvider: function ($templateFactory, url) {
					return $templateFactory.fromUrl(url.create('list'));
				},
				controller: 'ListCtrl'
			})
			.state("detail", {
				templateProvider: function ($templateFactory, url) {
					return $templateFactory.fromUrl(url.create('detail'));
				},
				params: {
					bookmark: {}
				},
				controller: 'DetailCtrl'
			})
			.state("add", {
				templateProvider: function ($templateFactory, url) {
					return $templateFactory.fromUrl(url.create('add'));
				},
				controller: 'AddCtrl'
			});
	}]);

	angular.module('app.controllers', [])

	// Define scope in this way to avoid 'Unknown provider' problem
	//      https://groups.google.com/forum/#!msg/angular/_EMeX_Dci2U/xQuDwWadCrsJ
	.controller("ListCtrl", ['$scope', '$rootScope', '$http', '$timeout', 'urlFactory', 'bookmarkFactory', '$stateParams',
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
		}]
	).controller('DetailCtrl', ['$scope', '$rootScope', 'bookmarkFactory', '$state', '$stateParams',
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
	}]).controller('AddCtrl', ['$scope', '$rootScope', 'bookmarkFactory', '$state', '$stateParams',
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

	// Don't use 'ng-app', but bootstrap Angular ourselves, so we can control
	// naming and scoping when portlet is instanceable
	//      http://stackoverflow.com/questions/18571301/angularjs-multiple-ng-app-within-a-page
	//      http://docs.angularjs.org/guide/bootstrap
	angular.bootstrap(document.getElementById(id),[id]);
}