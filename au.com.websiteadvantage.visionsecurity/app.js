'use strict';

const Homey = require('homey');

class Vision extends Homey.App {

	async onInit() {

		this.log('Vision app is running...');
	}
}

module.exports = Vision;