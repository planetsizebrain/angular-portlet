// A custom directive that used a partial HTML template to output some Liferay data
angular.module('app.directives').
	directive('liferay', ['$rootScope', 'urlFactory',
		function($rootScope, urlFactory) {
			var directive = {};

			directive.restrict = 'E';
			directive.templateUrl = urlFactory.create($rootScope.portletId, 'liferay');

			return directive;
		}
	]
);