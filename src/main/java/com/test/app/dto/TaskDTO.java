package com.test.app.dto;

public class TaskDTO extends BaseDTO {
	private static final long serialVersionUID = 5344293063550020567L;
	private String name;
	private Boolean completed;

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