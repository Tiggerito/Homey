"use strict";

// https://forums.whirlpool.net.au/archive/2440219

const Homey = require('homey');

class DaikinSkyFi extends Homey.App {

    async onInit() {
        this.log('Daikin SkyFi app is running...');
    }
}

module.exports = DaikinSkyFi;
