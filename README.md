angular-portlet
===============

An example portlet that shows how AngularJS can be used in a portal environment. It shows how the following thing can be done:

* Multiple instances of the same Angular portlet (requires bootstrapping Angular yourself)
* How to get ngRoute to work when direct URL access isn't possible
* Using Liferay JSON services in AngularJS
* How to reference partial HTML files (create correct portlet resource URL)
* Portlet event integration in AngularJS
* i18n via angular-translate that uses the Liferay and portlet resource bundles
* Providing your own JSON services using a portlet resource request (and some fancy custom code so it can be done using annotations, complete with caching)
* How to avoid the one big Javascript file problem in a Maven project without using Grunt, etc...
* A custom AngularJS directive (referencing a partial HTML as a template)

As mentioned the portlet contains some additional code that isn't specifically needed for the AngularJS part, but that does some nice stuff that makes exposing JSON stuff from your portlet easier.

For this there is a base portlet class that you can extend, ResourcePortlet (which itself extends from Liferay's MVCPortlet), that enables you to just annotate some simple methods in your portlet as being resource providers.

The annotations that accomplish this are:

* @Resource
* @Param
* @Context
* @CacheResource
