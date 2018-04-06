package com.test.app.dao;

import com.test.app.beans.Task;
import org.springframework.stereotype.Repository;

@Repository
public class TaskDAO extends BaseDAO<Task> implements ITaskDAO {
	public TaskDAO() {
		super(Task.class);
	}
}
