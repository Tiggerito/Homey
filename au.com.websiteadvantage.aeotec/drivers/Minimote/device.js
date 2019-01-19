'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

// Documentation: http://products.z-wavealliance.org/products/1584


class Aeotec_Minimote extends ZwaveDevice {
	onMeshInit() {
		// let PreviousSequenceNo = 'empty';

		//this.log('Aeotec_Minimote');

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		//this.printNode();

		// register device capabilities
	//	this.registerCapability('alarm_battery', 'BATTERY');
	//	this.registerCapability('measure_battery', 'BATTERY');

		// define and register FlowCardTriggers
		let triggerMinimote_button = new Homey.FlowCardTriggerDevice('Minimote_button');
		triggerMinimote_button
			.register()
			.registerRunListener((args, state) => {
				return Promise.resolve(args.button === state.button && args.method === state.method);
			});

		let triggerMinimote_scene = new Homey.FlowCardTriggerDevice('Minimote_scene');
		triggerMinimote_scene
			.register();

		// register a report listener (SDK2 style not yet operational) https://athombv.github.io/node-homey-meshdriver/ZwaveDevice.html
		this.registerReportListener('SCENE_ACTIVATION', 'SCENE_ACTIVATION_SET', (rawReport, parsedReport) => {

			//this.log('Aeotec_Minimote SCENE_ACTIVATION');

			//const triggerId = triggerMap[report['Scene ID']];

			let scene = rawReport['Scene ID'].toString();
			let button = "0";
			let method = "Key Pressed";

			switch(scene) {
				case "1":
					button = "1";
					method = "Key Pressed";
					break;
				case "2":
					button = "1";
					method = "Key Held Down";
					break;
				case "3":
					button = "2";
					method = "Key Pressed";
					break;
				case "4":
					button = "2";
					method = "Key Held Down";
					break;
				case "5":
					button = "3";
					method = "Key Pressed";
					break;
				case "6":
					button = "3";
					method = "Key Held Down";
					break;
				case "7":
					button = "4";
					method = "Key Pressed";
					break;
				case "8":
					button = "4";
					method = "Key Held Down";
					break;
			}

			if (rawReport.hasOwnProperty('Scene ID')) {
				const remoteValue = {
					scene: scene,
					button: button,
					method: method
				};
				this.log('Triggering sequence:', rawReport['Scene ID'], 'remoteValue', remoteValue);
				// Trigger the trigger card with tokens
				triggerMinimote_button.trigger(this, triggerMinimote_button.getArgumentValues, remoteValue);

				triggerMinimote_scene.trigger(this, remoteValue, null);
			}
		});
	}
}
module.exports = Aeotec_Minimote;
