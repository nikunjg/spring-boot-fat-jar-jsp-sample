package com.test.app.dto;

import java.io.Serializable;

public abstract class BaseDTO implements Serializable {

	private static final long serialVersionUID = 3217219709920765133L;
	private Long id;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}	
}