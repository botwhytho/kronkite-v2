/*--- core.ajax-provider.js ---*/

Core.modules["ajax-provider"] = function(CORE) { 
	
	function onError(e) {
		console.error(e);
		return;
	}

	function ajaxProvider({url, data, method, async}) {
		console.log("preparing AJAX request...", {url, data, method, async});

		var promise = new Promise(function(resolve, reject) {
			$.ajax({
				url: url,
				data: data || null,
				method: method || "GET",
		  		success: function (data, status, response) { 
		  			resolve({data: data, 
						status: status, 
						response: response
					});
		  		},
		  		error: function (response, status, error) { 
		  			reject({response: response, 
		  				status: status,
		  				error: error
		  			}); 
		  		}
			});
		});				
		return promise;
	}

	return CORE["ajax-provider"] = ajaxProvider;
};

