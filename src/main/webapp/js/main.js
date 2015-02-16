'use strict';

function bootstrap(id, portletId) {

	var module = angular.module(id, ["ui.router", "app.factories", "app.controllers", "pascalprecht.translate"]);

	module.directive('liferay', ['$rootScope', 'urlFactory', function($rootScope, urlFactory) {
		var directive = {};

		directive.restrict = 'E';
		directive.templateUrl = urlFactory.create($rootScope.portletId, 'liferay');

		return directive;
	}]);

	module.run(['$rootScope', 'releaseFactory', 'urlFactory', function ($rootScope, releaseFactory, urlFactory) {
		// Calculate the actual portlet ID and put that in the root scope for all to use.
		$rootScope.portletId = portletId.substr(1, portletId.length - 2);

		$rootScope.liferay = {
			token: Liferay.authToken,
			companyId: Liferay.ThemeDisplay.getCompanyId(),
			loggedIn: Liferay.ThemeDisplay.isSignedIn()
		};

		releaseFactory.getRelease($rootScope.portletId).then(function(release) {
			$rootScope.liferay.release = release;
		});

		// We're using the $stateChangeStart event as a point to intervene in the navigation so
		// that we can correct the templateUrl values that are used, because the need to be able
		// to be resolved as a valid portlet resource URL. We use the existence of a dummy property
		// to see if the URL is already fixed or not.
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			if (!toState.hasOwnProperty('fixedUrl')) {
				toState.templateUrl = urlFactory.create($rootScope.portletId, toState.templateUrl);
				toState.fixedUrl = true;
			}
		});
	}]);

	module.config(['$urlRouterProvider', '$stateProvider', '$locationProvider', '$translateProvider', 'urlProvider',
			function($urlRouterProvider, $stateProvider, $locationProvider, $translateProvider, urlProvider) {

		urlProvider.setPid(portletId);

		$translateProvider.useUrlLoader(urlProvider.$get().createResource('language', 'locale', Liferay.ThemeDisplay.getBCP47LanguageId()));
		$translateProvider.preferredLanguage(Liferay.ThemeDisplay.getBCP47LanguageId());

		// No # when routing!
		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state("list", {
				url: '/',
				templateUrl: 'list',
				controller: 'ListCtrl'
			})
			.state("detail", {
				templateUrl: 'detail',
				params: {
					bookmark: {}
				},
				controller: 'DetailCtrl'
			})
			.state("add", {
				templateUrl: 'add',
				controller: 'AddCtrl'
			});
	}]);

	// Don't use 'ng-app', but bootstrap Angular ourselves, so we can control naming and
	// scoping when portlet is instanceable:
	//      http://stackoverflow.com/questions/18571301/angularjs-multiple-ng-app-within-a-page
	//      http://docs.angularjs.org/guide/bootstrap
	//
	// We use the element ID, something that is based on the portlet instance ID, as the
	// Angular module ID.
	angular.bootstrap(document.getElementById(id), [id]);
}