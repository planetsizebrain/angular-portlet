package be.aca.liferay.angular.portlet.filter;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import com.liferay.portal.kernel.util.StringPool;
import com.liferay.portal.model.Portlet;
import com.liferay.portal.service.PortletLocalServiceUtil;
import org.reflections.Reflections;

import javax.portlet.PortletException;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import javax.portlet.filter.FilterChain;
import javax.portlet.filter.FilterConfig;
import javax.portlet.filter.ResourceFilter;
import java.io.IOException;
import java.util.Set;

// http://stackoverflow.com/questions/14618924/how-to-get-init-param-of-portlet-xml-in-liferay
// http://diliptechnotes.blogspot.be/2010/10/jsr-286-portlet-filter-feature.html
public class ResourceCachingFilter implements ResourceFilter {

	private static final String RESOURCE_IDS_PARAM = "resourceIds";

	private Class portletClass;
	private Set<String> resourceIds;

	@Override
	public void init(FilterConfig filterConfig) throws PortletException {
		String value = filterConfig.getInitParameter(RESOURCE_IDS_PARAM);

		if (Strings.isNullOrEmpty(value)) {
			resourceIds = Sets.newHashSet();
		} else {
			resourceIds = Sets.newHashSet(Splitter.on(StringPool.COMMA).split(value));
		}

		Portlet portlet = PortletLocalServiceUtil.getPortletById("angular_WAR_angularportlet");
		try {
			portletClass = Class.forName(portlet.getPortletClass());

			Reflections reflections = new Reflections("be.aca.liferay.angular.portlet");

			// TODO
		} catch (ClassNotFoundException cnfe) {
			throw new PortletException("Couldn't find portlet class needed to configure filter", cnfe);
		}
	}

	@Override
	public void doFilter(ResourceRequest request, ResourceResponse response, FilterChain chain) throws IOException, PortletException {
	   // TODO

		chain.doFilter(request, response);
	}

	@Override
	public void destroy() {
		// Do nothing
	}
}
