define(['underscore', 'knockout', 'utils'],
function(_,ko,U) {
	function List(defs, object, order, options) {
		this.defs = defs;
		this._data = {};
		this._order = order;
		this._selected = ko.observable(null);
		this._sortField = ko.observable("");
		this._visible = ko.observable(true);
		this._filterVisible = ko.observable(false);
		this._filterCondition = ko.observable(false);
		this._filterField = ko.observable("");
		this._filterValue = ko.observable("");
		options = options || {};
		var self = this;
		_.each(this.defs, function(key) {
			if(U.type(key)=="object") {
				if(U.type(key.properties)=="array" && U.type(key.element)=="string") {
					console.log("[List::option]", options[key.key]);
					self[key.key] = List.create(key.properties, object.find(key.element), options);
					if(options.hasOwnProperty(key.key) && U.type(options[key.key])=="function") {
						console.log("[List::option*function]", options[key.key]);
						self['__'+key.key] = self[key.key];
						self[key.key] = ko.computed(options[key.key], self, {deferEvaluation :true});
					}
					else if(options.hasOwnProperty(key.key) && U.type(options[key.key])=="object"
						&& U.type(options[key.key].read)=="function") {
						self['__'+key.key] = self[key.key];
						console.log("[List::option*object]", options[key.key], self['__'+key.key]);
						self[key.key] = ko.computed({
							read: options[key.key].read,
							write: options[key.key].write,
							deferEvaluation :true,
							owner: self
						});
					}
				}
				return;
			}
			this[key] = object.attr(key);
			self[key] = ko.observable(this[key]);
		}, this._data);
	}
	List.create = function(properties, element, options) {
		var list = [];
		options = options || {};
		element.each(function() {
			var item = new List(properties, $(this), list.length, options);
			if(options.hasOwnProperty('selected') && U.type(options.selected)=="function") {
				item._selected.subscribe(options.selected, item);
			}
			if(options.hasOwnProperty('visible') && U.type(options.visible)=="function") {
				item._visible.subscribe(options.visible, item);
			}
			if(options.hasOwnProperty('filter') && U.type(options.filter)=="function") {
				item._filterCondition.subscribe(options.filter, item);
			}
			list.push(item);
		});
		return ko.observableArray(list);
	};
	
	return List;
});