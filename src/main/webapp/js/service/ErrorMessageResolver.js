angular.module("app.factories").

	// A custom error message resolver that provides custom error messages defined
	// in the Liferay/portlet language bundles.	Uses a prefix key so they don't clash
	// with other Liferay keys and reuses the code from the library itself to
	// replace the {0} values.
	factory('i18nErrorMessageResolver', ['$q', '$translate',
		function($q, $translate) {

			var resolve = function(errorType, el) {
				var defer = $q.defer();

				var prefix = "validation.";
				$translate(prefix + errorType).then(function(message) {
					if (el && el.attr) {
						try {
							var parameters = [];
							var parameter = el.attr('ng-' + errorType);
							if (parameter === undefined) {
								parameter = el.attr('data-ng-' + errorType) || el.attr(errorType);
							}

							parameters.push(parameter || '');

							message = message.format(parameters);
						} catch (e) {}
					}

					defer.resolve(message);
				});

				return defer.promise;
			};

			return {
				resolve: resolve
			};
		}
	]
);