/*--- core.ajax-provider.js ---*/

Application.CORE["ajax-provider"] = (function() { 

	function onChange(xhr) {
		if (xhr.status === 200) {
		        this.resolve(JSON.parse(xhr.responseText));
		} else {
			var errorObject = {
				response: JSON.parse(xhr.responseText),
				xhr
			};
			console.error(errorObject);
			this.reject(errorObject);
		}
	}

	function ajaxProvider({url, data, method, async}) {
		console.log("preparing AJAX request...", {url, data, method, async});

		var promise = new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest(),
			responseData;

			xhr.open(method, url, async); 
			xhr.send(data); 
			xhr.onreadystatechange = onChange.bind({resolve, reject})		
		});	

		return promise;
	}

	return {ajaxProvider}
}());
