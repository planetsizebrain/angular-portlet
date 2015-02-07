package be.aca.liferay.angular.portlet.resource;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface CacheResource {

	public String keyParam();
}