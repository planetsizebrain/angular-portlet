angular.module("app.factories").
	provider('url', function() {
		// In the provider function, you cannot inject any service or factory.
		// This can only be done at the "$get" method.

		this.pid = '';

		this.$get = function() {
			var pid = this.pid;
			return {
				createRenderUrl: function(page) {
					var resourceURL = Liferay.PortletURL.createRenderURL();
					resourceURL.setPortletId(pid);
					resourceURL.setPortletMode('view');
					resourceURL.setWindowState('exclusive');
					resourceURL.setParameter('jspPage', '/partials/' + page + '.html');

					return resourceURL.toString();
				},
				createResourceUrl: function(resourceId, paramName, paramValue) {
					// Need to set both resourceId and portletId for request to work
					// resourceId can be used to check and distinguish on server side
					var resourceURL = Liferay.PortletURL.createResourceURL();
					resourceURL.setPortletId(pid);
					resourceURL.setResourceId(resourceId);
					resourceURL.setParameter(paramName, paramValue);

					return resourceURL.toString();
				}
			}
		};

		this.setPid = function(pid) {
			this.pid = pid.substr(1, pid.length - 2);
		};
	}
);