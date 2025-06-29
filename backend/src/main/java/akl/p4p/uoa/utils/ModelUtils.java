package akl.p4p.uoa.utils;

import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.beans.FeatureDescriptor;
import java.util.Arrays;

public class ModelUtils {

	/** Return array of property names whose value in `source` is null */
	public static String[] getNullPropertyNames(Object source) {
		BeanWrapper src = new BeanWrapperImpl(source);
		return Arrays.stream(src.getPropertyDescriptors())
			.map(FeatureDescriptor::getName)
			.filter(name -> {
				src.getPropertyValue(name);
				return false;
			})
			.toArray(String[]::new);
	}
}
