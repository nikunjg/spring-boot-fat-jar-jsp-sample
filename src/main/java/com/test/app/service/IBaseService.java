package com.test.app.service;

import com.test.app.beans.BaseDomain;
import com.test.app.dao.IBaseDAO;
import com.test.app.dto.BaseDTO;

import java.util.Collection;

public interface IBaseService<T extends BaseDTO, V extends BaseDomain> {
	IBaseDAO<V> getDao();
	Collection<T> getAll();
	T get(Long id);
	T save(T dto);
	T update(T dto);
	boolean delete(T dto);
}
