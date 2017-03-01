/*--- core.broadcast.js ---*/

/*globals Container */

Container.modules.broadcast = function(APP) { 
	var eventManifest = {};

	function sendNotifications(data) {
		return function(resultObj, eventName) {
			resultObj[eventName] = this[eventName](data);
			return resultObj;
		}
	}
	
	function notify(eventList) {
		return function(data) {
			return eventList.reduce(sendNotifications(data).bind(eventManifest), {});
		} 
	}


	function listen(eventArray) { 
		eventArray.forEach(function(eventObj) {
			eventManifest[eventObj.event] = eventObj.action;
		});
		return;
	}
	
	APP.broadcast = {notify, listen};
};
