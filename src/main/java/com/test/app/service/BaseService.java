package com.test.app.service;

import com.test.app.beans.BaseDomain;
import com.test.app.dao.IBaseDAO;
import com.test.app.dto.BaseDTO;
import com.test.app.util.Utility;

import java.util.*;


public abstract class BaseService<T extends BaseDTO, V extends BaseDomain> implements IBaseService<T, V> {
	
	private Class<T> dtoClass;
	private Class<V> beanClass;
	public BaseService(Class<T> dtoClass, Class<V> beanClass) {
		this.dtoClass = dtoClass;
		this.beanClass = beanClass;
	}
	public Class<T> getDtoClass() {
		return dtoClass;
	}
	public Class<V> getBeanClass() {
		return beanClass;
	}
	
	public Collection<T> getAll() {
		Collection<V> beans = this.getDao().getAll();
		if(beans != null && !beans.isEmpty()) {
			Collection<T> dtos = this.getCollection(beans);
			for(V bean: beans) {
				dtos.add(this.copyToDto(bean));
			}
			return dtos;
		}
		return new LinkedList<>();
	}
	
	@Override
	public T get(Long id) {
		V bean = this.getDao().get(id);
		if(bean != null) {
			return this.copyToDto(bean);
		}
		return null;
	}
	
	@Override
	public T save(T dto) {
		if(dto != null) {
			V bean = this.getDao().save(this.copyToBean(dto));
			if(bean != null) {
				return this.copyToDto(bean);
			}
		}
		return null;
	}
	
	@Override
	public T update(T dto) {
		if(dto != null) {
			V bean = this.getDao().update(this.copyToBean(dto));
			if(bean != null) {
				return this.copyToDto(bean);
			}
		}
		return null;
	}
	
	@Override
	public boolean delete(T dto) {
		if(dto != null) {
			return this.getDao().delete(this.copyToBean(dto));
		}
		return false;
	}
	
	private Collection<T> getCollection(Collection<V> beans) {
		if(beans instanceof List<?>) {
			return new ArrayList<>();
		} 
		return new LinkedHashSet<>();
	}
	
	protected V copyToBean(T dto) {
		V bean = null;
		try {
			return Utility.copy(beanClass, dto);
		} catch (InstantiationException | IllegalAccessException e) {
			// log exception
		}
		return bean;
	}
	
	protected T copyToDto(V bean) {
		T dto = null;
		try {
			return Utility.copy(dtoClass, bean);
		} catch (InstantiationException | IllegalAccessException e) {
			// log exception
		}
		return dto;
	}
	
	protected Collection<T> copyToDtoCollection(Collection<V> beans) {
		Collection<T> dtos = null;
		if(beans != null && !beans.isEmpty()) {
			if(beans instanceof Set) {
				dtos = new HashSet<>();
			} else {
				dtos = new ArrayList<>();
			}
			for (V bean:beans) {
				T dto = copyToDto(bean);
				if(dto != null) {
					dtos.add(dto);
				}
			}
		}
		return dtos;
	}
	
	protected Collection<V> copyToBeanCollection(Collection<T> dtos) {
		Collection<V> beans = null;
		if(dtos != null && !dtos.isEmpty()) {
			if(dtos instanceof Set) {
				beans = new HashSet<>();
			} else {
				beans = new ArrayList<>();
			}
			for (T dto:dtos) {
				V bean = copyToBean(dto);
				if(bean != null) {
					beans.add(bean);
				}
			}
		}
		return beans;
	}
	
	public abstract IBaseDAO<V> getDao();
}