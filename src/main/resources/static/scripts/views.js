function App_LayoutView(layoutTpl) {
	return new $.MVCLayoutView({
		template: layoutTpl,
		regions: {
			"headerRegion": ".content-header",
			"contentRegion": ".content-body"
		},
		className: "content-main"
	});
}

function App_HeaderView(headerTpl) {
	return new $.MVCView({
		template: headerTpl,
		triggers: {
			"click .operation-btn" : "operationMenu",
			"click .completed-list-btn" : "completedListMenu",
			"click .in-completed-list-btn" : "incompletedListMenu"
		}
	});
}


function Page_LayoutView(pageLayoutTpl, header) {
	return new $.MVCLayoutView({
		template: pageLayoutTpl,
		regions: {
			"pageBodyRegion": ".page-body"
		},
		data: {"header": header}
	});
}

function Operation_LayoutView(operationPageLayoutTpl) {
	return new $.MVCLayoutView({
		template: operationPageLayoutTpl,
		regions: {
			"addRegion": ".add-task-container",
			"listRegion": ".task-list-container"
		}
	});
}

function Operation_AddTaskView(createTaskTpl) {
	return new $.MVCView({
		template: createTaskTpl,
		className: "row",
		triggers: {
			"click .add-btn" : "task:add"
		}
	});
}


function List_TaskItemView(taskListItemTpl, showAction) {
	return new $.MVCView({
		template: taskListItemTpl,
		"tagName": "tr",
		triggers: {
			"click .delete-task" : "task:delete"
		},
		onRender: function() {
			var view = this.view();
			if(showAction) {
				view.$el.find(".status-item").remove();
				var view = this.view();
				var toggleBtn = view.$el.find(".toggle-btn");
				view.$el.find(".toggle-btn").bootstrapToggle({
			      on: 'Completed',
			      off: 'In-Complete'
			    });
				toggleBtn.change(function() {
					view.trigger("task:status:change", $(this).prop('checked'));
				})
			} else {
				view.$el.find(".action-item").remove();
			}
			
		}
	});
}

function List_NoTaskItemView(noTaskListTpl) {
	return new $.MVCView({
		template: noTaskListTpl,
		"tagName": "tr"
	});
}

function List_TaskListView(taskList, taskListTpl, taskListItemTpl, noTaskListTpl, showAction) {
	return new $.MVCCompositeView({
		template: taskListTpl,
		tagName: "table",
		className: "table table-bordered",
		childContainer: "tbody",
		childDataArr: taskList,
		childView: function() {
			return List_TaskItemView(taskListItemTpl, showAction);
		},
		noChildView: function() {
			return List_NoTaskItemView(noTaskListTpl);
		}
	});
}