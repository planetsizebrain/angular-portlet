angular.module("app.factories").
	//Provider style, full blown, configurable version
	provider('url', function() {
		// In the provider function, you cannot inject any
		// service or factory. This can only be done at the
		// "$get" method.

		this.pid = '';

		this.$get = function() {
			var pid = this.pid;
			return {
				create: function(page) {
					var resourceURL = Liferay.PortletURL.createRenderURL();
					resourceURL.setPortletId(pid.substr(1, pid.length - 2));
					resourceURL.setPortletMode('view');
					resourceURL.setWindowState('exclusive');
					resourceURL.setParameter('jspPage', '/partials/' + page + '.html');

					return resourceURL.toString();
				},
				createResource: function(resourceId, paramName, paramValue) {
					var resourceURL = Liferay.PortletURL.createResourceURL();
					resourceURL.setPortletId(pid.substr(1, pid.length - 2));
					resourceURL.setResourceId(resourceId);
					resourceURL.setParameter(paramName, paramValue);

					return resourceURL.toString();
				}
			}
		};

		this.setPid = function(pid) {
			this.pid = pid;
		};
	}).
	factory('urlFactory', function() {
		return {
			create: function(pid, name) {
				var resourceURL = Liferay.PortletURL.createRenderURL();
				resourceURL.setPortletId(pid);
				resourceURL.setPortletMode('view');
				resourceURL.setWindowState('exclusive');
				resourceURL.setParameter('jspPage', '/partials/' + name + '.html');

				return resourceURL.toString();
			},
			createResource: function(pid, resourceId, paramName, paramValue) {
				var resourceURL = Liferay.PortletURL.createResourceURL();
				resourceURL.setPortletId(pid);
				resourceURL.setResourceId(resourceId);
				resourceURL.setParameter(paramName, paramValue);

				return resourceURL.toString();
			}
		};
	}
);