define(['underscore', 'knockout', 'utils'],
function(_,ko,U) {
	function List(defs, object) {
		this.defs = defs;
		this._data = {};
		var self = this;
		_.each(this.defs, function(key) {
			if(U.type(key)=="object") {
				if(U.type(key.properties)=="array" && U.type(key.element)=="string") {
					self[key] = new List(key.properties, object.find(key.element));
				}
				return;
			}
			this[key] = obj.attr(key);
			self[key] = ko.observable(this[key]);
		}, this._data);
	}
	
	return List;
});