$(function() {
	$.defineTemplates(["layout.tpl", 
		"header.tpl", 
		"pageLayout.tpl",
		"operationPageLayout.tpl",
		"createTask.tpl",
		"taskList.tpl",
		"taskListItem.tpl",
		"noTaskList.tpl"], function(layoutTpl, headerTpl, pageLayoutTpl, operationPageLayoutTpl, createTaskTpl, taskListTpl, taskListItemTpl, noTaskListTpl) {
		var tasks = [];
		
		var deleteTask = function(task, callback) {
			$.mvcServiceAjax({
				"url": "task/delete",
				"data": task,
				"type": "DELETE",
				beforeSend: function() {
					$.showWaiting("Please wait while deleting Task:" + task.name);
				},
				success: function(response) {
					if(callback) {
						callback(response);
					}
				}, 
				error: function(xhr, status, error) {
					$.showMsg({"title": "Error", "message": "Unable to delete Task!", "style": "error"});
				},
				complete: function() {
					$.hideWaiting();
				}
			});
		}
		
		var saveUpdateTask = function(url, task, callback) {
			$.mvcServiceAjax({
				"url": url,
				"data": task,
				"type": "POST",
				beforeSend: function() {
					$.showWaiting("Please wait while saving Task:" + task.name);
				},
				success: function(response) {
					if(callback) {
						callback(response);
					}
				}, 
				error: function(xhr, status, error) {
					$.showMsg({"title": "Error", "message": "Unable to save Task!", "style": "error"});
				},
				complete: function() {
					$.hideWaiting();
				}
			});
		};
		
		var saveTask = function(task, callback) {
			saveUpdateTask("task/add", task, callback);
		};
		
		var updateTask = function(task, callback) {
			saveUpdateTask("task/update", task, callback);
		};
		
		var pageLayoutView = function(header) {
			return Page_LayoutView(pageLayoutTpl, header);
		};
		
		var makeSelectedActive = function(view, e) {
			view.$el.find("ul.nav-tabs li.active").removeClass("active");
			$(e.currentTarget).parent().addClass("active");
		};
		
		var listView = function(taskList, showAction) {
			var lView = List_TaskListView(taskList, taskListTpl, taskListItemTpl, noTaskListTpl, showAction);
			lView.on("childview:task:status:change", function(childView, completed) {
				updateTask({"id": childView.data.id, "name": childView.data.name, "completed": completed}, function() {
					$.showMsg({"title": "Success", "message": "Status for Task(<b>" + childView.data.name + "</b>)  has been changed to " + (completed ? "Completed" : "In-Complete") + " successfully.", "style": "notice"});
					childView.data.completed = completed;
				});
			});
			
			lView.on("childview:task:delete", function(childView, e) {
				deleteTask(childView.data, function() {
					var index = tasks.indexOf(childView.data);
					if(index > -1) {
						tasks.splice(index, 1);
					}
					index = taskList.indexOf(childView.data);
					if(index > -1) {
						taskList.splice(index, 1);
					}
					
					$.showMsg({"title": "Success", "message": "Task(<b>" + childView.data.name + "</b>)  deleted successfully.", "style": "notice"});
				});
			});
			return lView;
		};
		 
		var renderOperationPage = function(headerView, layoutView) {
			var pageLayout = pageLayoutView("Add Remove Update Task");
			var addPageLayout = Operation_LayoutView(operationPageLayoutTpl);
			var addTaskView = Operation_AddTaskView(createTaskTpl);
			var taskListView = listView(tasks, true);
			
			addTaskView.on("task:add", function() {
				var taskName = $.trim(addTaskView.$el.find(".task-name").val());
				addTaskView.$el.find(".task-name").val("");
				if(!taskName || taskName == null || taskName == '') {
					$.showMsg({"title": "Warning", "message": "Please enter name!", "style": "warning"});
				} else {
					saveTask({"name": taskName}, function(savedTask) {
						tasks.push(savedTask);
						$.showMsg({"title": "Success", "message": "Task(<b>" + savedTask.name + "</b>)  saved successfully.", "style": "notice"});
					});
				}
				
			});
			
			addPageLayout.on("render", function() {
				addPageLayout.getRegion("addRegion").show(addTaskView);
				addPageLayout.getRegion("listRegion").show(taskListView);
			});
			
			pageLayout.on("render", function() {
				pageLayout.getRegion("pageBodyRegion").show(addPageLayout);
			});
			
			
			layoutView.getRegion("contentRegion").show(pageLayout);
		};
		
		var renderCompletedTaskPage = function(headerView, layoutView) {
			var pageLayout = pageLayoutView("Completed Task");
			layoutView.getRegion("contentRegion").show(pageLayout);
			var completedTasks = $.grep(tasks, function(task) {
				return task.completed;
			});
			var taskListView = listView(completedTasks, false);
			pageLayout.on("render", function() {
				pageLayout.getRegion("pageBodyRegion").show(taskListView);
			});
		};
		
		var renderInCompletedTaskPage = function(headerView, layoutView) {
			var pageLayout = pageLayoutView("InCompleted Task");
			layoutView.getRegion("contentRegion").show(pageLayout);
			var pageLayout = pageLayoutView("Completed Task");
			layoutView.getRegion("contentRegion").show(pageLayout);
			var incompletedTasks = $.grep(tasks, function(task) {
				return !task.completed;
			});
			var taskListView = listView(incompletedTasks, false);
			pageLayout.on("render", function() {
				pageLayout.getRegion("pageBodyRegion").show(taskListView);
			});
		};
		
		var renderHeader = function(layoutView) {
			var headerView = App_HeaderView(headerTpl);
			
			headerView.on("operationMenu", function(e) {
				makeSelectedActive(headerView, e);
				renderOperationPage(headerView, layoutView);
			});
			
			headerView.on("completedListMenu", function(e) {
				makeSelectedActive(headerView, e);
				renderCompletedTaskPage(headerView, layoutView);
			});

			headerView.on("incompletedListMenu", function(e) {
				makeSelectedActive(headerView, e);
				renderInCompletedTaskPage(headerView, layoutView);
			});
			
			
			headerView.on("render", function() {
				renderOperationPage(headerView, layoutView);
			});
			layoutView.getRegion("headerRegion").show(headerView);
		};
		
		var renderPage = function(taskObjects) {
			tasks = taskObjects;
			var layoutView = App_LayoutView(layoutTpl);
			
			layoutView.on("render", function() {
				renderHeader(layoutView);				
			});
			$("body").append(layoutView.render().$el)
		};
		
		var loadTasks = function() {
			$.mvcServiceAjax({
				"url": "task/all",
				beforeSend: function() {
					$.showWaiting("Please wait while loading Tasks!");
				},
				success: function(response) {
					renderPage(response);
				}, 
				error: function() {
					$.showMsg({"title": "Error", "message": "Unable to load Tasks", "style": "error"});
				},
				complete: function() {
					$.hideWaiting();
				}
			});
		};
		loadTasks();
	}); 
});