// A custom directive that used a partial HTML template to output some Liferay data
angular.module('app.directives').
	directive('liferay', ['url',
		function(url) {
			var directive = {};

			directive.restrict = 'E';
			directive.templateUrl = url.createRenderUrl('liferay');

			return directive;
		}
	]
);