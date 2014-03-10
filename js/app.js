define(['jquery','underscore','knockout','utils','list'],
function($,_,ko,U, List) {
	$.event.props.push("dataTransfer");
	
	function loadFile(filename, model) {
		var progress = $('#progressbar');
		var progressbar = $('#progressbar .percent');
		
		progressbar.css('width', '0%');
		progressbar.text('0%');

		var properties = [
			"id",
			"name",
			"category",
			"sort",
			"channels",
			"defaultStake",
			{
				key: "events",
				properties: [
					"classId",
					"typeId",
					"typeName",
					"id",
					"displayOrder",
					"name",
					"url",
					"date",
					"time",
					"betTillDate",
					"betTillTime",
					"suspend",
					"sort",
					"status",
					"channels",
					"country",
					"racingNumber",
					"flags",
					"lastUpdateDate",
					"lastUpdateTime",
					"bankerMaxPrice",
					"bankerMaxPriceDecimal",
					"bankerMinPrice",
					"bankerMinPriceDecimal",
					"bankerMinEvents",
					"bankerMaxEvents"
				],
				element: "event"
			}
		];
		
		var reader = new FileReader();
		reader.onload = function(evt) {
			progressbar.css('width', '100%');
			progressbar.text('100%');
			$('#xml').html(evt.target.result);
			var response = $('#xml response');
			model.response.push({
				request: response.attr('request'),
				code: response.attr('code'),
				message: response.attr('message'),
				debug: response.attr('debug'),
				provider: response.attr('provider'),
				coupons: List.create(
						properties,
						response.find('coupon'),
						{
							filter: function() {
								console.log("[MainViewModel:List:filter]", arguments, this._filterCondition(), this._filterField(), this._filterValue());
								//this._filterValue();
							},
							events: function() {
								console.log("[MainViewModel:List:events]", arguments, this);
								var filter = {
									field: ko.unwrap(this._filterField()),
									value: ko.unwrap(this._filterValue())
								};
								console.log("[MainViewModel:List:events]", filter);
								var events = [];
								_.each(this.__events(), function(item) {
									if(""==filter.field || (item[filter.field]()==filter.value)) {
										this.push(item);
									}
								}, events);
								var target = ko.unwrap(this._selected);
								if (!target) {
									console.log("[MainViewModel:List:events] sorting on insert order");
									events.sort(function(left, right) {
										return (left._order==right._order?0:left._order<right._order?-1:1);
									});
								} else if(target.hasClass('on2')) {
									var field = target.attr('rel');
									console.log("[MainViewModel:List:events] sorting on", field, "descending order");
									events.sort(function(left, right) {
										return ko.unwrap(right[field]).localeCompare(ko.unwrap(left[field]));
									});
								} else if (target.hasClass("on1")) {
									var field = target.attr('rel');
									console.log("[MainViewModel:List:events] sorting on", field, "ascending order");
									events.sort(function(left, right) {
										return ko.unwrap(left[field]).localeCompare(ko.unwrap(right[field]));
									});
								}
								
								return events;
							}
						})
			});
			
			setTimeout(function() {
				progress.removeClass("loading");
			}, 2000);
		};
		reader.onloadstart = function() {
			if(!progress.hasClass("loading")) {
				progress.addClass("loading");
			}
		};
		reader.onerror = function(evt) {
			switch(evt.target.error.code) {
		      case evt.target.error.NOT_FOUND_ERR:
		        alert('File Not Found!');
		        break;
		      case evt.target.error.NOT_READABLE_ERR:
		        alert('File is not readable');
		        break;
		      case evt.target.error.ABORT_ERR:
		        break; // noop
		      default:
		        alert('An error occurred reading this file.');
		    };
		    if(!progress.hasClass("error")) {
				progress.addClass("error");
			}
		};
		reader.onabort = function() {
			if(!progress.hasClass("abort")) {
				progress.addClass("abort");
			}
		};
		reader.onprogress = function(evt) {
			if (evt.lengthComputable) {
				var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
				// Increase the progress bar length.
				if (percentLoaded < 100) {
					progressbar.css('width', percentLoaded + '%');
					progressbar.text(percentLoaded + '%');
				}
			}
		};
		
		reader.readAsText(filename);
	}
	
	function MainViewModel() {
		this.init();
	}
	MainViewModel.prototype = {
		init: function() {
			var model = this;
			this.url = ko.observable();
			this.response = ko.observableArray();
			this._filterElement = ko.observable(null);
			
			ko.bindingHandlers.dropzone = {
				init: function(element, valueAccessor) {
					var $element = $(element);
					$element.on('dragover', function(event) {
						event.stopPropagation();
						event.preventDefault();
						event.dataTransfer.dropEffect = 'copy';
					});
					$element.on('drop', function(event) {
						event.stopPropagation();
						event.preventDefault();
						
						_.each(event.dataTransfer.files,
						function(file) {
							console.log(file);
							loadFile(file, model);
						});
					});
				},
				update: function(element, valueAccessor) {
					
				}
			};
			ko.bindingHandlers.filter = {
				init: function() {
					console.log("[filter:init]", arguments);
				},
				update: function() {
					console.log("[filter:update]", arguments);
				}
			};
		},
		
		load: function(model, event) {
			_.each(event.target.files,
			function(file) {
				console.log(file);
				loadFile(file, model);
			});
		},
		
		start: function() {
			var self = this;
			$(function() {
				ko.applyBindings(self);
			});
		},
		
		// Events
		click: function(object, event) {
			console.log("[ViewModel:click]", arguments);
			$('#coupon_'+object.id).toggleClass('selected');
			$('.coupon_'+object.id).fadeToggle('fast');
		},
		
		sort: function(object, event) {
			var target = $(event.target);
			var applyTo = target.attr('applyTo');
			console.log("[ViewModel:sort]", arguments, applyTo);
			var selected = ko.unwrap(this._selected);
			if(selected && !selected.is(target)) {
				console.log("[ViewModel:sort]", "cleanup", selected);
				selected.removeClass("on1 on2");
			}
			if(!target.hasClass('on1')) {
				console.log("[ViewModel:sort]", "setting 'on1' in", target);
				target.addClass("on1");
			} else if(!target.hasClass('on2')) {
				console.log("[ViewModel:sort]", "setting 'on2' in", target);
				target.addClass("on2");
			} else {
				console.log("[ViewModel:sort]", "clearing 'on*' in", target);
				target.removeClass("on1 on2");
				target = null;
			}
			this._selected(target);
		},
		
		checked: function(model, event, status, parent) {
			var target = $(event.target);
			var applyTo = target.attr('applyTo');
			console.log("[MainViewModel:checked]", arguments, applyTo);
			var lastTarget = ko.unwrap(this._filterElement());
			if(lastTarget) {
				lastTarget._filterCondition(false);
			}
			parent._filterVisible(true);
			parent._filterField(status);
			parent._filterValue(model[status]());
			this._filterElement(model);
		},
		
		removeFilter: function(model) {
			console.log("[MainViewModel:removeFilter]", arguments);
			model._filterField("");
			model._filterValue("");
			model._filterVisible(false);
		}
	};
	
	return new MainViewModel();
});