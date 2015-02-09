package be.aca.liferay.angular.portlet;

import be.aca.liferay.angular.portlet.resource.CacheResource;
import be.aca.liferay.angular.portlet.resource.Resource;
import be.aca.liferay.angular.portlet.resource.ResourceParam;
import be.aca.liferay.angular.portlet.resource.ResourcePortlet;
import com.google.common.base.Strings;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.servlet.SessionMessages;
import com.liferay.portal.kernel.util.PortalClassLoaderUtil;
import com.liferay.portal.kernel.util.StringPool;
import com.liferay.portal.model.Release;
import com.liferay.portal.service.ReleaseLocalServiceUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.ProcessAction;
import javax.portlet.ResourceRequest;
import java.lang.reflect.Field;
import java.util.Locale;
import java.util.Map;

public class AngularPortlet extends ResourcePortlet {

	private static final Locale DEFAULT_LIFERAY_LOCALE = new Locale(StringPool.BLANK);

	private final static Logger logger = LoggerFactory.getLogger(AngularPortlet.class);

	@ProcessAction(name = "clearCache")
	public void clearCache(ActionRequest actionRequest, ActionResponse actionResponse) {
		resourceCache.invalidateAll();
		SessionMessages.add(actionRequest, "cache-cleared");
	}

	@Resource(id = "release")
	public Release getRelease(ResourceRequest resourceRequest, @ResourceParam String releaseId) throws SystemException, PortalException {
		long releaseIdValue = Long.parseLong(releaseId);
		return ReleaseLocalServiceUtil.getRelease(releaseIdValue);
	}

	@Resource(id = "language")
	@CacheResource(keyParam = "locale")
	public Map<String, String> getLanguage(ResourceRequest resourceRequest, @ResourceParam String locale) throws Exception {
		logger.debug("Get language bundle for locale {}", locale);
//		String param = resourceRequest.getParameter("locale");

		Locale localeValue = DEFAULT_LIFERAY_LOCALE;
		if (!Strings.isNullOrEmpty(locale)) {
			localeValue = Locale.forLanguageTag(locale);
		}

		ClassLoader portalClassLoader = PortalClassLoaderUtil.getClassLoader();

		Class c = portalClassLoader.loadClass("com.liferay.portal.language.LanguageResources");
		Field f = c.getDeclaredField("_languageMaps");
		f.setAccessible(true);

		Map<Locale, Map<String, String>> bundles = (Map<Locale, Map<String, String>>) f.get(null);

		return bundles.get(localeValue);
	}
}