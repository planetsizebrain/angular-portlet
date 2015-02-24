package be.aca.liferay.angular.portlet.resource;

import be.aca.liferay.angular.portlet.resource.annotation.CacheResource;
import be.aca.liferay.angular.portlet.resource.annotation.Resource;
import com.google.common.base.Optional;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.LoadingCache;
import com.liferay.util.bridges.mvc.MVCPortlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.portlet.PortletException;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.concurrent.TimeUnit;

public class ResourcePortlet extends MVCPortlet {

	private final static Logger logger = LoggerFactory.getLogger(ResourcePortlet.class);

	protected final Cache<ResourceContext, String> resourceCache = CacheBuilder.newBuilder()
			.maximumSize(64)
			.expireAfterWrite(10, TimeUnit.MINUTES)
			.build();

	private ResourceMethodExecutor methodExecutor = new ResourceMethodExecutor();

	@Override
	public void serveResource(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws IOException, PortletException {
		String resourceId = resourceRequest.getResourceID();

		Optional<Method> method = findMatchingResourceMethod(resourceId);
		if (method.isPresent()) {
			try {
				String json;
				ResourceContext context = new ResourceContext(this, resourceRequest, resourceResponse, method.get(), resourceId);

				CacheResource cacheResource = context.getMethod().getAnnotation(CacheResource.class);
				if (cacheResource != null) {
					String param = resourceRequest.getParameter(cacheResource.keyParam());
					context.setParamValue(param);

					logger.debug("Get resource {} with ID {} from cache", resourceId, param);

					json = resourceCache.getIfPresent(context);
					if (json == null) {
						json = methodExecutor.process(context);
						resourceCache.put(context, json);
					}
				} else {
					logger.debug("Get resource {} without cache", resourceId);

					json = methodExecutor.process(context);
				}

				resourceResponse.getWriter().print(json);
			} catch (Exception e) {
				logger.error("Problem calling resource serving method for {}", resourceId, e);
				throw new PortletException(e);
			}
		} else {
			logger.error("No matching resource method found for ID: {}", resourceId);
			throw new PortletException("No matching resource method found for ID: " + resourceId);
		}
	}

	private Optional<Method> findMatchingResourceMethod(String resourceId) {
		for (Method method : this.getClass().getMethods()) {
			for (Annotation annotation : method.getAnnotations()) {
				if (annotation.annotationType() == Resource.class) {
					Resource resource = (Resource) annotation;
					String id = resource.id();

					if (resourceId.equals(id) && method.getReturnType() != Void.TYPE) {
						return Optional.of(method);
					}
				}
			}
		}

		return Optional.absent();
	}
}