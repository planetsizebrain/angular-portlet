angular.module("app.factories").
	factory('releaseFactory', ['$q', '$http', 'url',
		function($q, $http, url) {
			var getRelease = function() {
				var deferred = $q.defer();
				var resource = url.createResourceUrl("release", "releaseId", "1");

				$http.get(resource.toString()).success(function(data, status, headers, config) {
					// this callback will be called asynchronously when the response is available
					deferred.resolve(data);
				});

				return deferred.promise;
			};

			return {
				getRelease: getRelease
			};
	}]
);