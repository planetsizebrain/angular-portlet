package be.aca.liferay.angular.portlet.resource;

import java.lang.annotation.*;

@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface Param {

	public String id() default "";
}