'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// http://aeotec.com/z-wave-repeater

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {},
	settings: {},
});
