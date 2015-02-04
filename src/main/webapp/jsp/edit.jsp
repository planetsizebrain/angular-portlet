<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>
<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %>

<portlet:defineObjects />

<portlet:actionURL var="portletActionURL" name="clearCache">
</portlet:actionURL>

<liferay-ui:success key="cache-cleared" message="Cache cleared" />

<form action="${portletActionURL}" method="post">
	<input value="Clear cache" type="submit">
</form>