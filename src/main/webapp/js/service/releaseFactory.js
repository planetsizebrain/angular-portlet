angular.module("app.factories").
	factory('releaseFactory', function($q, $http) {
		var getRelease = function(pid) {
			var deferred = $q.defer();
			var url = Liferay.PortletURL.createResourceURL();
			// Need to set both for request to work
			// resourceId can be used to check and distinguish on server side
			url.setResourceId('release');
			url.setPortletId(pid);
			url.setParameter("releaseId", "1");

			$http.get(url.toString()).success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				deferred.resolve(data);
			});

			return deferred.promise;
		};

		return {
			getRelease: getRelease
		};
	}
);