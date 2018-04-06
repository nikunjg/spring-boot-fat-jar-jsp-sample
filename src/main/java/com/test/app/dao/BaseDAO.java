package com.test.app.dao;

import com.test.app.beans.BaseDomain;
import com.test.app.util.Utility;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.Collection;

public abstract class BaseDAO<T extends BaseDomain> implements IBaseDAO<T> {
	@PersistenceContext
    private EntityManager entityManager;
	
	private Class<T> beanClass;
	public BaseDAO(Class<T> beanClass) {
		this.beanClass = beanClass;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public Collection<T> getAll() {
		return this.getCriteria().list();
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public T get(Long id) {
		return (T) this.getCriteria().add(Restrictions.eq("id", id)).uniqueResult();
	}
	
	@Override
	public T save(T bean) {
		Transaction tx = null;
		try {
			Session session = this.getSession();
			tx = session.beginTransaction();
			session.save(bean);
			tx.commit();
		} catch(Exception e) {
			if(tx != null) {
				tx.rollback();
			}
			e.printStackTrace();
		}
		
		return bean;
	}
	
	@Override
	public T update(T bean) {
		if(bean.getId() != null) {
			Session session = this.getSession();
			T toUpdate = (T) session.get(beanClass, bean.getId());
			if(toUpdate != null) {
				Transaction tx = null;
				try {
					tx = session.beginTransaction();
					Utility.copy(toUpdate, bean);
					session.update(toUpdate);
					tx.commit();
					return toUpdate;
				} catch (Exception e) {		
					if(tx != null) {
						tx.rollback();
					} 
					e.printStackTrace();
				}
			}
		}	
		return null;
	}
	
	@Override
	public boolean delete(T bean) {
		if(bean.getId() != null) {
			Session session = this.getSession();
			bean = (T) session.get(beanClass, bean.getId());
			if(bean != null) {
				Transaction tx = null;
				try {
					tx = session.beginTransaction();
					session.delete(bean);
					tx.commit();
					return true;					
				} catch(Exception e) {
					if(tx != null) {
						tx.rollback();
					}
					e.printStackTrace();
				}				
			}
		}
		return false;
	}
	
	protected Criteria getCriteria() {
		return this.getSession().createCriteria(beanClass);
	}
	
	protected Session getSession() {
		return entityManager.unwrap(Session.class);
	}
}