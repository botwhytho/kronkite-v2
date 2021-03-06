/*--- core.utils.js ---*/

/*globals Container */

Container.modules["utils"] = function({require, set}) { 
	
	function objectExtend(target) {
		var extObj,
		dupSourceObj;
		extObj = Object.keys(target).reduce(copyObject(target), {});

		function hasKeys(context) {
	      		return (function(element) {
	        		return this.includes(element);
	      		}).bind(context);
    		}

		function copyObject(context) {
			return (function(map, currVal) {
				map[currVal] = this[currVal];
				return map;
			}).bind(context);
		}

		return function(source) {
			dupSourceObj = Object.keys(source)
					.reduce(copyObject(source), {});

			return function(propsList) {
          			if(arguments.length !== 0) { 
           				Object.keys(dupSourceObj)
           				.filter(hasKeys(propsList))
              				.reduce(copyObject(
              					dupSourceObj), extObj);
          			} else {
            				//console.log("no args")
            				Object.keys(dupSourceObj)
            				.reduce(copyObject(
            					dupSourceObj), extObj);
          			}
          			return extObj;
        		};
      		};
	}

	function setCurrentNavLinkOnRefresh(hash) {
		var navItems = Array.from(document.querySelectorAll("body a.nav-link"));

		navItems.forEach(function(item) {
			if (item.getAttribute("href") === hash) {
				item.classList.add("active");
			} else {
				item.classList.remove("active");	
			}
		});
	}

	set("utils")({objectExtend, setCurrentNavLinkOnRefresh});
	return
};