package com.test.app.controller;

import com.test.app.dto.TaskDTO;
import com.test.app.service.ITaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/task")
public class TaskController extends BaseController<TaskDTO> {
	
	@Autowired
	private ITaskService service;

	public ITaskService getService() {
		return service;
	}

	public void setService(ITaskService service) {
		this.service = service;
	}	
	
	
}
