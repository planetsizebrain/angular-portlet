package be.aca.liferay.angular.portlet.resource;

import com.google.common.base.Joiner;
import com.google.common.base.Objects;
import com.liferay.portal.kernel.util.StringPool;

import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import java.lang.reflect.Method;

public final class ResourceContext {

	private ResourcePortlet portlet;
	private ResourceRequest request;
	private ResourceResponse response;
	private Method method;
	private String resourceId;
	private String paramValue;

	public ResourceContext(ResourcePortlet portlet, ResourceRequest request, ResourceResponse response, Method method, String resourceId) {
		this.portlet = portlet;
		this.request = request;
		this.response = response;
		this.method = method;
		this.resourceId = resourceId;
	}

	public ResourcePortlet getPortlet() {
		return portlet;
	}

	public ResourceRequest getRequest() {
		return request;
	}

	public ResourceResponse getResponse() {
		return response;
	}

	public String getKey() {
		return Joiner.on(StringPool.DASH).join(resourceId, paramValue);
	}

	public Method getMethod() {
		return method;
	}

	public void setParamValue(String paramValue) {
		this.paramValue = paramValue;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null || getClass() != obj.getClass()) {
			return false;
		}

		final ResourceContext other = (ResourceContext) obj;

		return Objects.equal(this.paramValue, other.paramValue) &&
				Objects.equal(this.resourceId, other.resourceId);
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(resourceId, paramValue);
	}
}
