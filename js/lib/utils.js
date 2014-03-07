/*
 * Utilities
 */

(function() {
	function Utils() {

	}
	Utils.prototype = {
			type: function(val) {
				return Object.prototype.toString.call(val).replace(/^\[object (.+)\]$/,"$1").toLowerCase();
			},

			merge: function (object, add) {
				var This = this;
				_.each(add, function(value, key) {
					if(This.type(key)=="string" &&
						"type"==key.toLowerCase() && 
						"merge"==key.toLowerCase() && 
						"update"==key.toLowerCase()) {
						return;
					}
					if(typeof(value)=="object") {
						this[key] = This.type(value)=="array"?[]:{};
						This.merge(this[key], value);
					} else {
						this[key] = value;
					}
				}, object);
			},
			
			update: function(object, add, space) {
				var This = this;
				if(typeof(space)=="undefined") {
					space = "";
				}
				_.each(add, function(value, key) {
					if(This.type(key)=="string" &&
						"type"==key.toLowerCase() && 
						"merge"==key.toLowerCase() && 
						"update"==key.toLowerCase() && 
						"guid"==key.toLowerCase()) {
						return;
					}
					if(typeof(value)=="object") {
						console.log(space, key, "= {");
						this[key] = This.type(value)=="array"?[]:{};
						This.update(this[key], value, space + " ");
						console.log(space, "}");
					} else {
						console.log(space, key, "=", value);
						this[key] = value;
					}
				}, object);
			},
			
			guid: function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				    return v.toString(16);
				});
			}
	};

	Utils.Env = {
			Global: null,
			Require: null
	};

	if (typeof global !== 'undefined' && typeof module !== 'undefined' && 'exports' in module) {
		Utils.Env.Global = global;
		Utils.Env.Require = module.require.bind(module);
		module.exports = new Utils();
	} else if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
		Utils.Env.Global = window;
		Utils.Env.Require = null;
		if (window.Utils) {
			(function() {
				var name, value, _ref, _results;
				_ref = window.Utils;
				_results = [];
				for (name in _ref) {
					if (!__hasProp.call(_ref, name)) continue;
					value = _ref[name];
					_results.push(Utils[name] = value);
				}
				return _results;
			})();
		}
		window.Utils = new Utils();
	} else if (typeof self !== 'undefined' && typeof navigator !== 'undefined') {
		Utils.Env.Global = self;
		Utils.Env.Require = self.importScripts.bind(self);
		self.Utils = new Utils();
	} else {
		throw new Error('utils.js loaded in an unsupported JavaScript environment.');
	}

}).call(this);