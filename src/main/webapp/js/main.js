'use strict';

function bootstrap(id, portletId) {

	var module = angular.module(id, ["ui.router", "app.factories", "app.controllers", "pascalprecht.translate"]);

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

	module.run(['$rootScope', 'releaseFactory', 'urlFactory', function ($rootScope, releaseFactory, urlFactory) {
		$rootScope.portletId = portletId.substr(1, portletId.length - 2);

		$rootScope.liferay = {
			token: Liferay.authToken,
			companyId: Liferay.ThemeDisplay.getCompanyId(),
			loggedIn: Liferay.ThemeDisplay.isSignedIn()
		}

		releaseFactory.getRelease($rootScope.portletId).then(function(release) {
			$rootScope.liferay.release = release;
		});

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			if (!toState.hasOwnProperty('fixedUrl')) {
			//if (toState.templateUrl.indexOf($rootScope.portletId) == -1) {
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

	// Don't use 'ng-app', but bootstrap Angular ourselves, so we can control
	// naming and scoping when portlet is instanceable
	//      http://stackoverflow.com/questions/18571301/angularjs-multiple-ng-app-within-a-page
	//      http://docs.angularjs.org/guide/bootstrap
	angular.bootstrap(document.getElementById(id),[id]);
}