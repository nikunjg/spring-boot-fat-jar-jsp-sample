(function($, window, document, undefined) {
	var baseTemplateURL = function() {
		return $.getContextPath() + "/templates/";
	};
	
	var getDefaultTemplateAjaxOptions = function() {
		var options = $.getDefaultAjaxOptions();
		options["baseURL"] = baseTemplateURL();
		options["dataType"] = "text";
		options["contentType"] = "application/text";
		return options; 
	};
	
	$.templateAjax = function(options) {
		var that = this;
		that.options = jQuery.extend({}, getDefaultTemplateAjaxOptions(), options);
		return $.ajaxCall(that.options);
	};
	
	$.defineTemplates = function(templates, callback, templatePath) {
		if(templates) {
			var templateAjaxCall = [];
			$.each(templates, function(index, template) {
				if(templatePath) {
					template = templatePath + template;
				}
				var ajaxCall = $.templateAjax({url: template});
				templateAjaxCall.push(ajaxCall);
			});
			$.when.apply($, templateAjaxCall).then(function(schemas) {
				var calls = this;
				var args = [];
				if(callback) {
					if(calls.length > 0) {
						$.each(calls, function(index, call) {
							args.push(call.getResponse());	
						});
					} else if(calls.getResponse) {
						args.push(calls.getResponse());
					}
					callback.apply(this, args);
				}
			});
		}
	};

	
	var COMMON_DEFAULT_PROP = {
			tagName: "div",
			initialize: function(){},
			data: {},
			events: {},
			triggers: {},
			className: "",
			template: "",
			onRender: function() {},
			view: function() {return null},
			render: function() {
				var that = this.view();
				that.$el.html(that.template(that.data));
			}
	};
	
	
	var initializeView = function(view, defaults, options) {
		if(!view.triggerMap) {
			view.triggerMap = {};
		}
		view.globalTriggers = [];
		view.options = jQuery.extend({}, defaults, options);
		view.el = "<" + view.options.tagName + "></" + view.options.tagName + ">";
		view.$el = $(view.el);
		if(view.options.className && view.options.className != '') {
			var classNames = view.options.className.split(" ");
			$.each(classNames, function(index, className) {
				view.$el.addClass(className);
			});
		}
		options.el = view.el;
		options.$el = view.$el;
		view.data = options.data;
		view.options.initialize();
	};
	
	var parseTemplate = function(template, data) {
		return _.template(template)(data);
	};
	
	
	var functionArgs = function(func, keepTriggeredEvennt, view) {
		var args = [];
		if(func.arguments && func.arguments.length > 0) {
			$.each(func.arguments, function(index, param) {
				if(index == 0) {
					if(keepTriggeredEvennt) {
						args.push(param); 
						if(view) { // putting view on first parameter
							args.push(view);
						}
					}
				} else {
					args.push(param); 
				}
			});
		}
		return args;
	};
	
	var executeCallback = function(callback, args) {
		setTimeout(function() {
			callback.apply(this, args);
		}, 0);
	};
	
	
	var fireTriggerEvent = function(view, func, triggeredEvent, callbacks, forwardTriggeredEvent) {
		if(callbacks && callbacks.length > 0) {
			var args = functionArgs(func, forwardTriggeredEvent, view);
			
			$.each(callbacks, function(index, callback) {
				executeCallback(callback, args);
			});
		}
	};
	
	
	var fireTrigger = function(view, func, triggeredEvent) {
		fireTriggerEvent(view, func, triggeredEvent, view.triggerMap[triggeredEvent], false);
		fireTriggerEvent(view, func, triggeredEvent, view.globalTriggers, true);
	};
	
	var registerTrigger = function(view, triggeredEvent, callback) {
		var callbacks = view.triggerMap[triggeredEvent];
		if(!callbacks) {
			callbacks = [];
			view.triggerMap[triggeredEvent] = callbacks;
		}
		callbacks.push(callback);
	};
	
	
	var registerGlobalTrigger = function(view, callback) {
		view.globalTriggers.push(callback);
	};
	
	var bindViewEvents = function(view) {
		if(!$.isEmptyObject(view.options.events)) {
			$.each(view.options.events, function(key, value) {
				var keyArr = key.split(" ");
				if(keyArr.length > 1) {
					view.$el.find(keyArr[1]).on(keyArr[0], function(e) {
						if(value) {
							if(typeof value === 'function') {
								value(e);
							} else if(typeof value === 'string' && view.options[value]) {
								view.options[value](e);
							}
						}
					});
				}
			});
		}
	};
	
	var bindViewTriggers = function(view) {
		if(!$.isEmptyObject(view.options.triggers)) {
			$.each(view.options.triggers, function(key, value) {
				var keyArr = key.split(" ");
				if(keyArr.length > 1) {
					view.$el.find(keyArr[1]).on(keyArr[0], function(e) {
						view.trigger(value, e);
					});
				}
			});
		}
	};
	
	
	var RegionHolder = function(view, $regionEl, regionName) {
		var that = this;
		that.show = function(childView) {
			if($regionEl && $regionEl.length > 0) {
				$regionEl.html(childView.render().$el);
				view.trigger("region:view-added:" + regionName);
			}
		};
		
		that.clear = function() {
			if($regionEl && $regionEl.length > 0) {
				$regionEl.html("");
				view.trigger("region:view-cleared:" + regionName);
			}
		};
	};
	
	var populateRegions = function(view) {
		view.regionHolders = {};
		if(view.options.regions && !$.isEmptyObject(view.options.regions)) {
			$.each(view.options.regions, function(regionName, region) {
				view.regionHolders[regionName] = new RegionHolder(view, view.$el.find(region), regionName);
			});
		}
	};
	
	
	$.MVCLayoutView = function(options) {
		var that = this;
		that.triggerMap = {};
		var mvcLayoutViewDefaultOptions = jQuery.extend({}, COMMON_DEFAULT_PROP, {
			regions: {},
			view: function() {return that;}
		});
		
		that.getRegion = function(regionName) {
			return that.regionHolders[regionName];
		};
		
		that.template = function(data) {
			return parseTemplate(that.options.template, data);
		};
		
		that.trigger = function(triggeredEvent) {
			fireTrigger(that, that.trigger, triggeredEvent);
		};
		
		that.on = function(triggeredEvent, callback) {
			registerTrigger(that, triggeredEvent, callback);
		};
		
		that.on("asyn-render", function() {
			that.options.onRender();
			that.trigger("render");
		});
		
		that.render = function() {
			that.options.render();
			bindViewEvents(that);
			bindViewTriggers(that);
			populateRegions(that);
			that.trigger("asyn-render");
			return that;
		};
		
		initializeView(that, mvcLayoutViewDefaultOptions, options);
		return that;
	};
	
	
	$.MVCView = function(options) {
		var that = this;
		var mvcViewDefaultOptions = jQuery.extend({}, COMMON_DEFAULT_PROP, {
			view: function() {return that;}
		});
		
		that.template = function(data) {
			return parseTemplate(that.options.template, data);
		};
		
		that.trigger = function(triggeredEvent) {
			fireTrigger(that, that.trigger, triggeredEvent);
		};
		
		that.on = function(triggeredEvent, callback) {
			registerTrigger(that, triggeredEvent, callback);
		};
		
		that.render = function() {
			that.options.render();
			bindViewEvents(that);
			bindViewTriggers(that);
			that.options.onRender();
			that.trigger("render");
			return that;
		};
		
		initializeView(that, mvcViewDefaultOptions, options);
		return that;
	};
	
	
	$.MVCCompositeView = function(options) {
		var that = this;
		that.childViewAppender = "childview:";
		var mvcCompositeViewDefaultOptions = jQuery.extend({}, COMMON_DEFAULT_PROP, {
			childContainer: "",
			childDataArr: [],
			childView: null,
			noChildView: null,
			view: function() {return that;},
			onChildViewRender: function(childView) {}
		});
		
		that.template = function(data) {
			return parseTemplate(that.options.template, data);
		};
		
		that.trigger = function(triggeredEvent) {
			fireTrigger(that, that.trigger, triggeredEvent);
		};
		
		that.on = function(triggeredEvent, callback) {
			registerTrigger(that, triggeredEvent, callback);
		};
		
		that.childTrigger = function() {
			var args = functionArgs(that.childTrigger, true);
			args[0] = that.childViewAppender + args[0];
			that.trigger.apply(that, args);
		};
		
		that.renderChildView = function() {
			if(that.options.childContainer) {
				var childContainerElement = that.$el.find(that.options.childContainer);
				if(that.options.childDataArr && that.options.childDataArr.length > 0) {
					if(that.options.childView) {
						$.each(that.options.childDataArr, function(index, childData) {
							var childView = that.options.childView();
							childView.data = childData;
							childView.data["modelIndex"] = index;
							registerGlobalTrigger(childView, that.childTrigger);
							that.options.onChildViewRender(childView);
							childContainerElement.append(childView.render().$el);
						});
					}
				} else if(that.options.noChildView) {
					childContainerElement.html(that.options.noChildView().render().$el);
				}
			}
		};
		
		
		that.render = function() {
			that.options.render();
			bindViewEvents(that);
			bindViewTriggers(that);
			that.renderChildView();
			that.options.onRender();
			that.trigger("render");
			return that;
		};
		
		initializeView(that, mvcCompositeViewDefaultOptions, options);
		that.childDataArr = that.options.childDataArr;
		var childArrPush = that.childDataArr.push;
		that.childDataArr.push = function(obj) {
			childArrPush.call(that.childDataArr, obj);
			that.render();
			return this;
		};
		
		var childArrSplice = that.childDataArr.splice;
		that.childDataArr.splice = function(index, count) {
			childArrSplice.call(that.childDataArr, index, count);
			that.render();
			return this;
		};
		
		return that;
	};
})(jQuery, window, document);