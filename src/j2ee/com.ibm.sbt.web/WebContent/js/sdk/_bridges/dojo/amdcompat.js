/*
 * � Copyright IBM Corp. 2012
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 * 
 * http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

/**
 * Social Business Toolkit SDK.
 * 
 * Compatibility file for dojo14/15
 */
dojo.provide("sbt._bridge.amdcompat");

window._sbt_bridge_compat = true;

(function() {
   /*
	* Emulate the AMD syntax with older version of Dojo (1.4.3...). This file is
	* not mean to be included using a require statement, but simply as a <script>
	* tag like any regular JS files.
	* 
	* Note that this is *not* an asynchonous loader, as the module are still loaded
	* synchronously. It just 
	* 
	* References: http://bugs.dojotoolkit.org/ticket/11869
	* http://bugs.dojotoolkit.org/changeset/23053/dojo
	*  
	* Parts are extracted from Dojo 1.6.1 source code
	* addition to support AMD module format
	* replace the bootstrap define function (defined in _base/boostrap.js) with the
	* dojo v1.x simulated AMD loader...
	* 
	*/ 
	var global = window;
	var currentModule;
	
	var _load = dojo._loadModule; 
	dojo._loadModule = dojo.require = function(/*String*/moduleName, /*Boolean?*/omitModuleCheck){
		currentModule = moduleName;
		try {
			return _load.apply(null,arguments);
		} finally {
			currentModule = null;
		}
	};
	
	function _define(name, deps, def) {
		if(name) {
			var dottedName = name.replace(/\//g, ".");
			var exports = dojo.provide(dottedName);
		}

		function resolvePath(relativeId) {
			// do relative path resolution
			if (relativeId.charAt(0) === '.') {
				relativeId = name.substring(0, name.lastIndexOf('/') + 1)
						+ relativeId;
				while (lastId !== relativeId) {
					var lastId = relativeId;
					relativeId = relativeId.replace(/\/[^\/]*\/\.\.\//, '/');
				}
				relativeId = relativeId.replace(/\/\.\//g, '/');
			}
			return relativeId.replace(/\//g, ".");
		}
		
		for ( var args = [], depName, i = 0; i < deps.length; i++) {
			depName = resolvePath(deps[i]);
			// look for i18n! followed by anything followed by "/nls/"
			// followed
			// by anything without "/" followed by eos.
			var exclamationIndex = depName.indexOf("!");
			if (exclamationIndex > -1) {
				// fool the build system
				if (depName.substring(0, exclamationIndex) == "i18n") {
					var match = depName.match(/^i18n\!(.+)\.nls\.([^\.]+)$/);
					dojo["requireLocalization"](match[1], match[2]);
				}
				arg = null;
			} else {
				var arg;
				switch (depName) {
				case "require":
					arg = function(relativeId) {
						return dojo.require(resolvePath(relativeId));
					};
					break;
				case "exports":
					arg = exports;
					break;
				case "module":
					var module = arg = {
						exports : exports
					};
					break;
				case "dojox":
					arg = dojo.getObject(depName);
					break;
				case "dojo/lib/kernel":
				case "dojo/lib/backCompat":
					arg = dojo;
					break;
				default:
					arg = dojo.require(depName);
				}
			}
			args.push(arg);
		}
		if (typeof def == "function") {
			var returned = def.apply(null, args);
		} else {
			returned = def;
		}

		if(name) {
			if (returned) {
				dojo._loadedModules[dottedName] = returned;
				dojo.setObject(dottedName, returned);
			}
			if (module) {
				dojo._loadedModules[dottedName] = module.exports;
			}
			return returned;
		}

	};
	
	global.define = function(name, deps, def) {
		if (!def) {
			// less than 3 args
			if (deps) {
				// 2 args
				def = deps;
				deps = name;
			} else {
				// one arg
				def = name;
				deps = typeof def == "function" ? [ "require","exports","module" ].slice(0, def.length) : [];
			}
			name = currentModule ? currentModule.replace(/\./g, '/') : "anon";
			//console.log("currentModule="+currentModule+", name="+name);
		}
		return _define(name,deps,def);
	};

	global.require = function(deps, def) {
		return _define(null,deps,def);
	};

	define.vendor = "dojotoolkit.org";
	define.version = dojo.version;
	define("dojo/lib/kernel", [], dojo);
	define("dojo/lib/backCompat", [], dojo);
	define("dojo", [], dojo);
	define("dijit", [], this.dijit || (this.dijit = {}));
	
	/*
     * Some common Dojo method
     */	
	define("dojo/ready", [], function() {
		return dojo.ready || dojo.addOnLoad;	
	});
	define("dojo/declare", [], function() {
		return dojo.declare;	
	});
	
})();
