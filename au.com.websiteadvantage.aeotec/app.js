'use strict';

const Homey = require('homey');

class Aeotec extends Homey.App {

	async onInit() {

		this.log('Aeotec app is running...');
	}
}

module.exports = Aeotec;