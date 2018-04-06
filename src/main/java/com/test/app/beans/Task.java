package com.test.app.beans;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table
public class Task extends BaseDomain {
	
	private static final long serialVersionUID = -5776065637383241410L;
	
	@Column
	private String name;
	
	@Column
	private Boolean completed = false;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Boolean getCompleted() {
		return completed;
	}

	public void setCompleted(Boolean completed) {
		this.completed = completed;
	}
}