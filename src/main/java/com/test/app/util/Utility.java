package com.test.app.util;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashSet;

public final class Utility {
	private Utility() {
	}
	
	public static <T> T getInstance(Class<T> clazz) throws InstantiationException, IllegalAccessException {
		return clazz.newInstance();
	}
	
	public static <T, V> T copy(Class<T> toClazz, V from) throws InstantiationException, IllegalAccessException {
		return copy(getInstance(toClazz), from);
	}
	
	public static <T, V> T copy(T to, V from) throws InstantiationException, IllegalAccessException {
		for(String propertyName: getAllPropertyNames(to.getClass())) {
			Object value = getPropertyValue(from, propertyName);
			if(value != null) {
				setPropertyValue(to, propertyName, value);
			}
		}
		return to;
	}
	
	private static void setPropertyValue(Object obj, String propertyName, Object value) {
		try {
			Method method = getMethod(obj.getClass(), getSetterMethod(propertyName), value.getClass());
			method.invoke(obj, value);
		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException | SecurityException | NullPointerException e) {
			// log exception
		}
	}
	
	private static Object getPropertyValue(Object obj, String propertyName) {
		Class<?> clazz = obj.getClass();
		Method method = null;
		try {
			method = clazz.getMethod(getGetterMethod(propertyName));
			if(method == null) {
				method = clazz.getMethod(getBooleanGetterMethod(propertyName));
			}
			
		} catch (IllegalArgumentException| NoSuchMethodException | SecurityException | NullPointerException e) {
			if(method == null) {
				try {
					method = clazz.getMethod(getBooleanGetterMethod(propertyName));
				} catch (NoSuchMethodException | SecurityException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
			}
		}
		if(method != null) {
			try {
				return method.invoke(obj);
			} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return null;
	}
	
	public static Collection<String> getAllPropertyNames(Class<?> clazz) {
		Collection<String> properties = new HashSet<>();
		for(Field field: clazz.getDeclaredFields()) {
			try {
				if(getMethod(clazz, getGetterMethod(field.getName())) != null || getMethod(clazz, getBooleanGetterMethod(field.getName())) != null) {
					properties.add(field.getName());
				}
			} catch (SecurityException e) {
				// log exception
			}
		}
		if(!clazz.getSuperclass().equals(Object.class)) {
			properties.addAll(getAllPropertyNames(clazz.getSuperclass()));
		}
		return properties;
	}
	
	private static Method getMethod(Class<?> clazz, String name,  Class<?>... parameterTypes) {
		try {
			return clazz.getDeclaredMethod(name, parameterTypes);
		} catch (NoSuchMethodException | SecurityException e) {
			if(!clazz.getSuperclass().equals(Object.class)) {
				return getMethod(clazz.getSuperclass(), name, parameterTypes);
			}
		}
		return null;
	}
	
	private static String getGetterMethod(String propertyName) {
		return "get" + convertFirstLetterUppercase(propertyName);
	}
	
	private static String getBooleanGetterMethod(String propertyName) {
		return "is" + convertFirstLetterUppercase(propertyName);
	}
	
	private static String getSetterMethod(String propertyName) {
		return "set" + convertFirstLetterUppercase(propertyName);
	}
	
	private static String convertFirstLetterUppercase(String name) {
		return name.substring(0, 1).toUpperCase() + name.substring(1);
	}
}