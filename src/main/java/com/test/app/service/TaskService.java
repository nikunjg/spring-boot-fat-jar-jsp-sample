package com.test.app.service;

import com.test.app.beans.Task;
import com.test.app.dao.ITaskDAO;
import com.test.app.dto.TaskDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TaskService extends BaseService<TaskDTO, Task> implements ITaskService {

	@Autowired
	private ITaskDAO dao;
	
	public TaskService() {
		super(TaskDTO.class, Task.class);
	}

	public ITaskDAO getDao() {
		return dao;
	}

	public void setDao(ITaskDAO dao) {
		this.dao = dao;
	}	
}