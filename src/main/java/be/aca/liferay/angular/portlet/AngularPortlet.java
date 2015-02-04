package be.aca.liferay.angular.portlet;

import com.google.common.base.Strings;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.servlet.SessionMessages;
import com.liferay.portal.kernel.util.PortalClassLoaderUtil;
import com.liferay.portal.kernel.util.StringPool;
import com.liferay.portal.model.Release;
import com.liferay.portal.service.ReleaseLocalServiceUtil;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.ProcessAction;
import javax.portlet.ResourceRequest;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

public class AngularPortlet extends BasePortlet {

	private static final Locale DEFAULT_LIFERAY_LOCALE = new Locale(StringPool.BLANK);
	private static final LoadingCache<Locale, Map<String, String>> TRANSLATION_CACHE = CacheBuilder.newBuilder()
			.maximumSize(64)
			.expireAfterWrite(10, TimeUnit.MINUTES)
			.build(new TranslationCacheLoader());

	@ProcessAction(name="clearCache")
	public void clearCache(ActionRequest actionRequest, ActionResponse actionResponse) {
		TRANSLATION_CACHE.invalidateAll();
		SessionMessages.add(actionRequest, "cache-cleared");
	}

	@Resource(id = "release")
	public Release getRelease(ResourceRequest resourceRequest) throws SystemException, PortalException {
		long releaseId = Long.parseLong(resourceRequest.getParameter("releaseId"));
		return ReleaseLocalServiceUtil.getRelease(releaseId);
	}

	@Resource(id = "language")
	public Map<String, String> getLanguage(ResourceRequest resourceRequest) throws Exception {
		String param = resourceRequest.getParameter("locale");

		Locale locale = DEFAULT_LIFERAY_LOCALE;
		if (!Strings.isNullOrEmpty(param)) {
			locale = Locale.forLanguageTag(param);
		}

		return TRANSLATION_CACHE.get(locale);
	}

	private static class TranslationCacheLoader extends CacheLoader<Locale, Map<String, String>> {

		@Override
		public Map<String, String> load(Locale locale) throws Exception {
			ClassLoader portalClassLoader = PortalClassLoaderUtil.getClassLoader();

			Class c = portalClassLoader.loadClass("com.liferay.portal.language.LanguageResources");
			Field f = c.getDeclaredField("_languageMaps");
			f.setAccessible(true);

			Map<Locale, Map<String, String>> bundles = (Map<Locale, Map<String, String>>) f.get(null);

			return bundles.get(locale);
		}
	}
}