define(['jquery','underscore','knockout','utils'],
function($,_,ko,U) {
	$.event.props.push("dataTransfer");
	
	function readCoupon(element) {
		var coupons = [];
		element.each(function() {
			var item = $(this);
			console.log("[readCoupon]", arguments);
			coupons.push({
				id: item.attr('id'),
				name: item.attr('name'),
				category: item.attr('category'),
				sort: item.attr('sort'),
				channels: item.attr('channels'),
				defaultStake: item.attr('defaultStake')
			});
		});
		return coupons;
	}
	function loadFile(filename, model) {
		var progress = $('#progressbar');
		var progressbar = $('#progressbar .percent');
		
		progressbar.css('width', '0%');
		progressbar.text('0%');
		
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
				coupons: readCoupon(response.find('coupon'))
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
		},
		
		load: function(model, event) {
			_.each(event.target.files,
			function(file) {
				console.log(file);
				loadFile(file, model);
			});
		},
		
		start: function() {
			$(function() {
				ko.applyBindings(new MainViewModel());
			});
		}
	};
	
	return new MainViewModel();
});