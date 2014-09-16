package be.aca.liferay.angular.portlet;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.model.Release;
import com.liferay.portal.service.ReleaseLocalServiceUtil;

import javax.portlet.ResourceRequest;

public class AngularPortlet extends BasePortlet {

	@Resource(id = "release")
	public Release getRelease(ResourceRequest resourceRequest) throws SystemException, PortalException {
		long releaseId = Long.parseLong(resourceRequest.getParameter("releaseId"));
		return ReleaseLocalServiceUtil.getRelease(releaseId);
	}
}