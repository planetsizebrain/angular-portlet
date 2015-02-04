'use strict';

angular.module("app.factories", []).

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
		}
	};
}).
factory('bookmarkFactory', function($q) {
	var getBookmarks = function() {
		var deferred = $q.defer();

		Liferay.Service(
			'/bookmarksentry/get-group-entries',
			{
				groupId: Liferay.ThemeDisplay.getScopeGroupId(),
				start: -1,
				end: -1
			},
			// Calling like this, with additional function param, calls it async
			// http://www.liferay.com/de/community/forums/-/message_boards/view_message/12303402
			// Using promise ($q) to make this work
			function(obj) {
				deferred.resolve(obj);
			}
		);

		return deferred.promise;
	};

	var saveBookmark = function(bookmark) {
		var deferred = $q.defer();

		Liferay.Service(
			'/bookmarksentry/update-entry',
			{
				entryId: bookmark.entryId,
				groupId: bookmark.groupId,
				folderId: bookmark.folderId,
				name: bookmark.name,
				url: bookmark.url,
				description: bookmark.description,
				serviceContext: {}
			},
			function(obj) {
				deferred.resolve(obj);
			}
		);

		return deferred.promise;
	}

	var addBookmark = function(bookmark) {
		var deferred = $q.defer();

		Liferay.Service(
			'/bookmarksentry/add-entry',
			{
				groupId: Liferay.ThemeDisplay.getScopeGroupId(),
				folderId: 0,
				name: bookmark.name,
				url: bookmark.url,
				description: bookmark.description,
				serviceContext: {}
			},
			function(obj) {
				deferred.resolve(obj);
			}
		);

		return deferred.promise;
	}

	var deleteBookmark = function(bookmark) {
		var deferred = $q.defer();

		Liferay.Service(
			'/bookmarksentry/delete-entry',
			{
				entryId: bookmark.entryId
			},
			function(obj) {
				deferred.resolve(obj);
			}
		);

		return deferred.promise;
	}

	return {
		getBookmarks: getBookmarks,
		saveBookmark: saveBookmark,
		addBookmark: addBookmark,
		deleteBookmark: deleteBookmark
	};
}).
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
});