/*
 * Utilities
 */

(function() {
	console.log("Utils", global);

	function Utils() {

	}
	Utils.prototype = {
			type: function(val) {
				return Object.prototype.toString.call(val).replace(/^\[object (.+)\]$/,"$1").toLowerCase();
			},

			merge: function (object, add) {
				_.each(add, function(value, key) {
					if(typeof(value)=="object") {
						this[key] = this.type(value)=="array"?[]:{};
						merge(this[key], value);
					} else {
						this[key] = value;
					}
				}, object);
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