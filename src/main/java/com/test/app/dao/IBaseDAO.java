package com.test.app.dao;

import com.test.app.beans.BaseDomain;

import java.util.Collection;

public interface IBaseDAO<T extends BaseDomain> {
	Collection<T> getAll();
	T get(Long id);
	T save(T bean);
	T update(T bean);
	boolean delete(T bean);
}
