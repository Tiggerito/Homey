const Homey = require('homey');

module.exports = class DaikinSkyFiDriver extends Homey.Driver {

    // This method is called when a user is adding a device
    // and the 'list_devices' view is called
    onPairListDevices(data, callback) {
        callback(null, [
            {
                name: 'Daikin SkyFi',
                data: {
                    id: '1' // unique value per device for the specific driver. Only support one for now
                }
            }
        ]);
    }

}