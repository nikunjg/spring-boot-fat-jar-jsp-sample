(function($, window, document, undefined) {
	var fileNameRegex = /(?:\.([^.]+))?$/;
	
	var ACTIVE_STATUS = 'a';
	var keyProperty = "@id";
	var refProperty = "@ref";
	var authHeaderPropertyName = "admin";
	var baseURL = "/";
	
	var contextPath;
	
	$.setContextPath = function(cPath) {
		contextPath = cPath;
	};
	
	$.getContextPath = function() {
		return contextPath;
	}
	
	$.getFileExtension = function(fileName) {
		return fileNameRegex.exec(fileName)[1];
	};
	
	
	$.getServiceBaseURL = function() {
		return baseURL;
	};
	
	
	$(document).ready(function() {
		$("body").append("<div class='overlay-back'></div>");
		var waitingContentContainer = $("<div class='waiting-content-container'></div>");
		$("body").append(waitingContentContainer);
		var waitingContent = $("<div class='waiting-content'></div>");
		waitingContentContainer.append(waitingContent);
		waitingContent.append("<i class='fa fa-spinner fa-spin waiting-spinner'></i>");
		waitingContent.append("<div class='msg'></div>");
	});
	
	
	$.adjustPopupTop = function(popupContent) {
		var top = ($(window).height() - popupContent.innerHeight()) / 2;
		popupContent.css("margin-top", top + "px");
	};
	
	$(window).resize(function() {
		$.adjustPopupTop($(".waiting-content-container .waiting-content"));
	});
	
	$.showWaiting = function(message) {
		$.adjustPopupTop($(".waiting-content-container .waiting-content"));
		$(".waiting-content-container .waiting-content .msg").html(message);
		$(".overlay-back").addClass("show");
		$(".waiting-content-container").addClass("show"); 
	};
	
	$.hideWaiting = function() {
		$(".overlay-back").removeClass("show");
		$(".waiting-content-container").removeClass("show"); 
	};
	
	$.showMsg = function(options) {
		$.growl({title: options.title, style: options.style, message: options.message});
	};
	
	
	$.getDefaultAjaxHeader = function() {
		var headerMap = {};
		// can be added default headers here like logged in user
		return headerMap; 
	};
	
	$.copyProperty = function(source, destination) {
		var keys = Object.keys(source);
		for(var i=0; i < keys.length; i++ ) {
			var key = keys[i];
			destination[key] = source[key];
		}
	};
	
	$.mentainJSONObjectRelation = function(obj, elementMap) {
		if(obj && typeof(obj) === 'object') {
			if(!elementMap) {
				elementMap = {};
			}
			var keys = Object.keys(obj);
			for(var i=0; i < keys.length; i++ ) {
				var key = keys[i];
				var value = obj[key];
				if(value) {
					if(typeof(value) === 'object') {
						$.mentainJSONObjectRelation(value, elementMap);
					} else if(key === keyProperty) {
						elementMap[value] = obj;
					} else if(key === refProperty) {
						obj = $.copyProperty(elementMap[value], obj);
					}	
				}
			}
		}
	};
	
	
	$.getDefaultAjaxOptions = function() {
		return {
			url : "",
			baseURL: baseURL,
			type: "GET",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			headers: $.getDefaultAjaxHeader(),
			data: {},
			beforeSend: function() {},
			success: function(response) {},
			error: function(xhr, status, error) {},
			complete: function(xhr, status) {}
		};
	};
	
	
	$.mvcServiceAjax = function(options) {
		var that = this;
		that.options = jQuery.extend({}, $.getDefaultAjaxOptions(), options);
		return $.ajaxCall(that.options);
	}
	
	$.ajaxCall = function(options) {
		var ajaxOptions = {
			url: options.baseURL + options.url,
			type: options.type,
			headers: options.headers,
			crossOrigin: true,
			dataType: options.dataType,
			contentType: options.contentType,
			beforeSend:  function() {
				options.beforeSend();
			}, 
			success: function(response) {
				$.mentainJSONObjectRelation(response);
				options.success(response);
				this.getResponse = function() {
					return response;
				};
			},
			error: function(xhr, status, error) {
				options.error(xhr, status, error);
			},
			complete: function(xhr, status) {
				options.complete(xhr, status);
			} 
		}; 
		if(!$.isEmptyObject(options.data)) {
			ajaxOptions["data"] = JSON.stringify(options.data);
		}
		return $.ajax(ajaxOptions);
	};
	
	
	$.existInArray = function(arr, element, compare) {
		var result = false;
		if(compare && arr) {
			$.each(arr, function(index, el) {
				if(compare(el, element)) {
					result = true;
				}
			});
		}
		return result;
	};
})(jQuery, window, document);