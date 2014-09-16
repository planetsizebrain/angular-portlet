package be.aca.liferay.angular.portlet;

import com.google.gson.Gson;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.util.bridges.mvc.MVCPortlet;

import javax.portlet.PortletException;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;

public class BasePortlet extends MVCPortlet {

	private static Log LOGGER = LogFactoryUtil.getLog(BasePortlet.class);

	@Override
	public void serveResource(ResourceRequest resourceRequest, ResourceResponse resourceResponse) throws IOException, PortletException {
		String resourceId = resourceRequest.getResourceID();

		for (Method method : this.getClass().getMethods()) {
			for (Annotation annotation : method.getAnnotations()) {
				if (annotation.annotationType() == Resource.class) {
					String id = ((Resource) annotation).id();
					if (id.equals(resourceId) && method.getReturnType() != Void.TYPE) {
						try {
							Object result = method.invoke(this, resourceRequest);

							String json = "";
							if (result != null) {
								Gson gson = new Gson();
								json = gson.toJson(result);
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
}