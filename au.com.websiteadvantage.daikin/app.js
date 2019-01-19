"use strict";

// https://forums.whirlpool.net.au/archive/2440219

var http = require('http.min');

var self = module.exports = {
	
	init: function(){	
		
		
		http('http://192.168.1.11:2000/ac.cgi?pass=93236')
			.then(function (result) {
				Homey.log('Code: ' + result.response.statusCode);
				Homey.log('Response: ' + result.data);
		});		
	
	}
	
};
