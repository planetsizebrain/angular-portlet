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
		//$translateProvider.useLocalStorage();
	}]);

	// http://fdietz.github.io/recipes-with-angular-js/directives/passing-configuration-params-using-html-attributes.html
	module.directive('i18n', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attributes) {
				var message = Liferay.Language.get(attributes["i18n"]);
				element.html(message);
			}
		}
	});

	module.factory('GetName', ['$http', '$timeout',
		function($http, $timeout) {
			return {
				get : function(porletId, page) {
					var resourceURL = Liferay.PortletURL.createRenderURL();
					resourceURL.setPortletId(portletId.substr(1, portletId.length - 2));
					resourceURL.setPortletMode('view');
					resourceURL.setWindowState('exclusive');
					resourceURL.setParameter('jspPage', '/partials/' + page + '.html');

					return resourceURL.toString();
				}
			};
		}
	]);

	module.config(['$urlRouterProvider', '$stateProvider', '$locationProvider', 'urlProvider',
			function($urlRouterProvider, $stateProvider, $locationProvider, urlProvider) {

		urlProvider.setPid(portletId);

		// No # when routing!
		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state("list", {
				url: '/',
				templateUrl: function ($stateParams) {
					var resourceURL = Liferay.PortletURL.createRenderURL();
					resourceURL.setPortletId(portletId.substr(1, portletId.length - 2));
					resourceURL.setPortletMode('view');
					resourceURL.setWindowState('exclusive');
					resourceURL.setParameter('jspPage', '/partials/list.html');

					return resourceURL.toString();
				}
				//controller: 'FirstCtrl'
			})
			.state("detail", {
				templateProvider: function ($templateFactory, url) {
					return $templateFactory.fromUrl(url.create('detail'));
				},
				params: {
					bookmark: {}
				},
				controller: 'EditCtrl'
			})
			.state("add", {
				templateUrl: function ($stateParams) {
					var resourceURL = Liferay.PortletURL.createRenderURL();
					resourceURL.setPortletId(portletId.substr(1, portletId.length - 2));
					resourceURL.setPortletMode('view');
					resourceURL.setWindowState('exclusive');
					resourceURL.setParameter('jspPage', '/partials/add.html');

					return resourceURL.toString();
				}
				//controller: 'SecondCtrl'
			});
	}]);

	angular.module('app.controllers', [])

	// Define scope in this way to avoid 'Unknown provider' problem
	//      https://groups.google.com/forum/#!msg/angular/_EMeX_Dci2U/xQuDwWadCrsJ
	.controller("MainCtrl", ['$scope', '$rootScope', '$http', '$timeout', 'urlFactory', 'bookmarkFactory', 'releaseFactory', '$stateParams',
		function($scope, $rootScope, $http, $timeout, urlFactory, bookmarkFactory, releaseFactory, $stateParams) {
			$scope.id = id;
			$scope.portletId = portletId.substr(1, portletId.length - 2);

			$scope.page = urlFactory.create($scope.portletId, 'list');

			// Getting Liferay stuff in Javascript
			// http://www.marconapolitano.it/en/liferay/39-how-to-use-liferay-themedisplay-object-with-javascript.html
			$scope.model = {
				currentBookmark: $stateParams.bookmark,
				token: Liferay.authToken,
				companyId: Liferay.ThemeDisplay.getCompanyId(),
				loggedIn: Liferay.ThemeDisplay.isSignedIn()
			}

			bookmarkFactory.getBookmarks().then(function(bookmarks) {
				$scope.model.bookmarks = bookmarks;
			});

			releaseFactory.getRelease($scope.portletId).then(function(release) {
				$scope.model.release = release;
			});

			$scope.main = function() {
				$scope.model.currentBookmark = {};
				$scope.page = urlFactory.create($scope.portletId, 'list');
				$scope.reload();
			}

			$scope.detail = function(bookmark) {
				$scope.model.currentBookmark = bookmark;
				$scope.page = urlFactory.create($scope.portletId, 'detail');
			}

			$scope.add = function() {
				$scope.model.currentBookmark = {};
				$scope.page = urlFactory.create($scope.portletId, 'add');
			}

			$scope.store = function() {
				bookmarkFactory.addBookmark($scope.model.currentBookmark).then(function(result) {
					Liferay.fire('reloadBookmarks', { portletId: $scope.portletId });
					$scope.main();
				});
			}

			$scope.save = function() {
				bookmarkFactory.saveBookmark($scope.model.currentBookmark).then(function(result) {
					Liferay.fire('reloadBookmarks', { portletId: $scope.portletId });
					$scope.main();
				});
			}

			$scope.delete = function(bookmark) {
				bookmarkFactory.deleteBookmark(bookmark).then(function(result) {
					Liferay.fire('reloadBookmarks', { portletId: $scope.portletId });
					$scope.main();
				});
			}

			$scope.reload = function() {
				$timeout(function() {
					bookmarkFactory.getBookmarks().then(function(bookmarks) {
						$scope.model.bookmarks = bookmarks;
					});
				});
			}

			Liferay.on('reloadBookmarks', function(event) {
				// Filter out event if we triggered it in this portlet instance
				if (event.portletId != $scope.portletId) {
					$scope.reload();
				}
			});
		}]
	).controller('EditCtrl', ['$scope', '$rootScope', '$http', '$timeout', 'urlFactory', '$stateParams',
			function ($scope, $rootScope, $http, $timeout, urlFactory, $stateParams) {

		console.log("Params " + $stateParams.bookmark.entryId);

		$scope.model = {
			currentBookmark: $stateParams.bookmark,
			loggedIn: Liferay.ThemeDisplay.isSignedIn()
		}
	}]);

	// Don't use 'ng-app', but bootstrap Angular ourselves, so we can control
	// naming and scoping when portlet is instanceable
	//      http://stackoverflow.com/questions/18571301/angularjs-multiple-ng-app-within-a-page
	//      http://docs.angularjs.org/guide/bootstrap
	angular.bootstrap(document.getElementById(id),[id]);
}