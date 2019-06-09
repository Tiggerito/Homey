const Homey = require('homey');

const http = require('http.min');

module.exports = class DaikinSkyFiDevice extends Homey.Device {

    // this method is called when the Device is inited
    async onInit() {
     //   this.log('Device init');
        this.log('Name:', this.getName());
        this.log('Class:', this.getClass());

        this.timeoutPeriod = 10000; // ten seconds between checks

        // register capability listeners
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
        this.registerCapabilityListener('my_thermostat_mode', this.onCapabilityThermostatMode.bind(this));
        this.registerCapabilityListener('my_fan_speed', this.onCapabilityFanSpeed.bind(this));

        await this.onTimeout(); // start periodic checks
    }

    // periodically check the status of the Daikin
    async onTimeout() {
        try {
   //         this.log('Class:', this.getClass() + " timed out");

            await this.GetStatusAsync();

        }
        catch (error) {
            this.log('Error:', error);
        }
        finally {
            setTimeout(this.onTimeout.bind(this), this.timeoutPeriod); // wait till the next time
        }

    }

    async onCapabilityFanSpeed(value, opts) {
        //  https://developer.athom.com/docs/apps-reference

        let fanSpeed = ""; 

        switch (value) {
            case "high":
                fanSpeed = "3";
                break;
            case "medium":
                fanSpeed = "2";
                break;
            case "low":
                fanSpeed = "1";
                break;
        }

        if (fanSpeed !== "") {
            await this.SetAsync("f=" + fanSpeed);
        }
    }

    async onCapabilityThermostatMode(value, opts) {
        //  https://developer.athom.com/docs/apps-reference

        let mode = "";

        switch (value) {
            case "auto": 
                mode = "1";
                break;
            case "heat": 
                mode = "2";
                break;
            case "dry": 
                mode = "4";
                break;
            case "cool": 
                mode = "8";
                break;
            case "fan": 
                mode = "16";
                break;
        }

        if (mode !== "") {
            await this.SetAsync("m=" + mode);
        }
    }

    async onCapabilityTargetTemperature(value, opts) {
        await this.SetAsync("t=" + value);
    }
    // this method is called when the Device has requested a state change (turned on or off)
    async onCapabilityOnoff(value, opts) {
        await this.SetAsync("p=" + (value ? "1" : "0"));
    }

    async GetStatusAsync() {
        let data = await this.SendToDaikinAsync("ac.cgi", null);

        if (data !== undefined) { // happens when a request fails
            await this.UpdateStatusAsync(data);
        }

  //      return status;
    }

    async SetAsync(parameters) {
        let data = await this.SendToDaikinAsync("set.cgi", parameters);

        if (data !== undefined) { // happens when a request fails
            await this.UpdateStatusAsync(data);
        }

    //    return status;
    }

    async SendToDaikinAsync(command, parameters) {

        const settings = this.getSettings();

        let url = "http://" + settings.ip + ":2000/" + command+"?pass=" + settings.password;

        if (parameters !== null) {
            url += "&" + parameters;
        }

        http(url)
            .then(async result => {
     //           this.log('Code: ' + result.response.statusCode);
    //            this.log('Response: ' + result.data);
                await this.UpdateStatusAsync(result.data);
                return result.data;
            }).catch(err => {
                console.error(err);
            });
    }

    async UpdateStatusAsync(data) {
   //     this.log('UpdateStatusAsync: ' + data);
        let nameValues = data.split("&");

        for (var i = 0; i < nameValues.length; i++) {
            let nv = nameValues[i];
     //       this.log('UpdateStatusAsync nv: ' + nv);

            let nameValue = nv.split("=");

            let name = nameValue[0];
            let value = nameValue[1];

            await this.UpdateStatusValueAsync(name, value);
        }
    }

    async UpdateStatusValueAsync(name, value) {
        switch (name) {
            case "opmode":
                this.setCapabilityValue('onoff', value === "1" ? true : false)
                    .catch(err => {
                        console.error(err);
                    });
                break;
            case "roomtemp":
                this.setCapabilityValue('measure_temperature.inside', parseFloat(value))
                    .catch(err => {
                        console.error(err);
                    });
                break;
            case "outsidetemp":
                this.setCapabilityValue('measure_temperature.outside', parseFloat(value))
                    .catch(err => {
                        console.error(err);
                    });
                break;
            case "settemp":
                this.setCapabilityValue('target_temperature', parseFloat(value))
                    .catch(err => {
                        console.error(err);
                    });
                break;
            case "acmode":
                let mode = ""; // missing dry and fan. also has off. https://developer.athom.com/docs/apps-reference
                switch (value) {
                    case "1": // Auto
                        mode = "auto";
                        break;
                    case "2": // Heat
                        mode = "heat";
                        break;
                    case "4": // Dry
                        mode = "dry";
                        break;
                    case "8": // Cool
                        mode = "cool";
                        break;
                    case "16": // Fan
                        mode = "fan";
                        break;
                }

                if (mode !== "") {
                    this.setCapabilityValue('my_thermostat_mode', mode)
                        .catch(err => {
                            console.error(err);
                        });
                }
                break;
            case "fanspeed":
                let fanSpeed = ""; // missing dry and fan. also has off. https://developer.athom.com/docs/apps-reference
                switch (value) {
                    case "3": 
                        fanSpeed = "high";
                        break;
                    case "2": 
                        fanSpeed = "medium";
                        break;
                    case "1": 
                        fanSpeed = "low";
                        break;
                }

                if (fanSpeed !== "") {
                    this.setCapabilityValue('my_fan_speed', fanSpeed)
                        .catch(err => {
                            console.error(err);
                        });
                }
                break;

        }
    }
};