package be.aca.liferay.angular.portlet.resource;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.util.bridges.mvc.MVCPortlet;
import org.springframework.core.LocalVariableTableParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;

import javax.portlet.PortletException;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ResourcePortlet extends MVCPortlet {

	private static Log LOGGER = LogFactoryUtil.getLog(ResourcePortlet.class);

	protected final LoadingCache<ResourceCacheKey, String> resourceCache = CacheBuilder.newBuilder()
			.maximumSize(64)
			.expireAfterWrite(10, TimeUnit.MINUTES)
			.build(new ResourceCacheLoader());

	@Override
	public void serveResource(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws IOException, PortletException {
		String resourceId = resourceRequest.getResourceID();

		for (Method method : this.getClass().getMethods()) {
			for (Annotation annotation : method.getAnnotations()) {
				if (annotation.annotationType() == Resource.class) {
					Resource resource = (Resource) annotation;
					String id = resource.id();
					if (id.equals(resourceId) && method.getReturnType() != Void.TYPE) {
						try {
							String json;
							ResourceCacheKey key = new ResourceCacheKey(resourceRequest, resourceResponse, method, id);

							CacheResource cacheResource = method.getAnnotation(CacheResource.class);
							if (cacheResource != null) {
								String param = resourceRequest.getParameter(cacheResource.keyParam());
								key.setParamValue(param);

								System.out.println("GET RESOURCE WITH CACHE " + resourceId + " " + param);

								json = resourceCache.get(key);
							} else {
								System.out.println("GET RESOURCE WITHOUT CACHE");
								json = key.getResource();
							}

							resourceResponse.getWriter().print(json);
						} catch (Exception e) {
							LOGGER.error("Problem calling resource serving method for '" + resourceId + "'", e);
							throw new PortletException(e);
						}
					}
				}
			}
		}
	}

	private class ResourceCacheLoader extends CacheLoader<ResourceCacheKey, String> {

		@Override
		public String load(ResourceCacheKey key) throws Exception {
			System.out.println("LOAD CACHE ENTRY: " + key.getKey());
			return key.getResource();
		}
	}

	private class ResourceCacheKey {

		private ResourceRequest request;
		private ResourceResponse response;
		private Method method;
		private String resourceId;
		private String paramValue;

		public ResourceCacheKey(ResourceRequest request, ResourceResponse response, Method method, String resourceId) {
			this.request = request;
			this.response = response;
			this.method = method;
			this.resourceId = resourceId;
		}

		private String getResource() throws InvocationTargetException, IllegalAccessException {
			Annotation[][] paramAnnotations = method.getParameterAnnotations();
			// http://www.beyondjava.net/blog/reading-java-8-method-parameter-named-reflection/
			ParameterNameDiscoverer parameterNameDiscoverer = new LocalVariableTableParameterNameDiscoverer();
			String[] names = parameterNameDiscoverer.getParameterNames(method);
			Class[] types = method.getParameterTypes();

			// http://stackoverflow.com/questions/15139424/not-able-to-invoke-main-method-using-reflection-illegalargumentexception-argu
			List<Object> values = Lists.<Object>newArrayList();
			for (int i = 0; i < paramAnnotations.length; i++) {
				// http://tutorials.jenkov.com/java-reflection/annotations.html#parameter
				String name = names[i];
				Class type = types[i];

				System.out.println("PARAM NAME: " + name);

				Annotation[] annotations = paramAnnotations[i];

				if (annotations.length > 0) {
					for (Annotation annotation : annotations) {
						System.out.println("ANNO TYPE: " + annotation.annotationType());
						// http://stackoverflow.com/questions/3348363/checking-if-an-annotation-is-of-a-specific-type
						if (annotation instanceof Param) {
							System.out.println("FOUND PARAM");

							String value = request.getParameter(name);
							values.add(value);
						}
						if (annotation instanceof Context) {
							System.out.println("FOUND CONTEXT");
							if (type.isAssignableFrom(ResourceRequest.class)) {
								values.add(request);
							} else {
								values.add(response);
							}
						}
					}
				}
			}

			Object result = method.invoke(ResourcePortlet.this, values.toArray());

			String json = "";
			if (result != null) {
				Gson gson = new Gson();
				json = gson.toJson(result);
			}

			return json;
		}

		public void setParamValue(String paramValue) {
			this.paramValue = paramValue;
		}

		public String getKey() {
			return resourceId + "-" + paramValue;
		}

		@Override
		public boolean equals(Object o) {
			if (this == o) return true;
			if (o == null || getClass() != o.getClass()) return false;

			ResourceCacheKey that = (ResourceCacheKey) o;

			if (!paramValue.equals(that.paramValue)) return false;
			if (!resourceId.equals(that.resourceId)) return false;

			return true;
		}

		@Override
		public int hashCode() {
			int result = resourceId.hashCode();
			result = 31 * result + paramValue.hashCode();
			return result;
		}
	}
}