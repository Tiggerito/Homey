'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

// Documentation: http://products.z-wavealliance.org/products/1584


class VisionFob extends ZwaveDevice {
	onMeshInit() {
		// let PreviousSequenceNo = 'empty';

		//this.log('VisionFob');

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		//this.printNode();

		// register device capabilities
	//	this.registerCapability('alarm_battery', 'BATTERY');
		this.registerCapability('measure_battery', 'BATTERY');

		// define and register FlowCardTriggers
		// let triggerMinimote_button = new Homey.FlowCardTriggerDevice('Minimote_button');
		// triggerMinimote_button
		// 	.register()
		// 	.registerRunListener((args, state) => {
		// 		return Promise.resolve(args.button === state.button && args.method === state.method);
		// 	});

		let triggerVisionFob_scene = new Homey.FlowCardTriggerDevice('VisionFob_scene');
		triggerVisionFob_scene
			.register();

		// register a report listener (SDK2 style not yet operational) https://athombv.github.io/node-homey-meshdriver/ZwaveDevice.html
		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', (rawReport, parsedReport) => {

			//this.log('VisionFob CENTRAL_SCENE');

			//const triggerId = triggerMap[report['Scene ID']];

		
			if (rawReport.hasOwnProperty('Scene Number')) {
				let scene = rawReport['Scene Number'].toString();

				const remoteValue = {
					scene: scene
				};
				this.log('Triggering sequence:', rawReport['Scene Number'], 'remoteValue', remoteValue);
				// Trigger the trigger card with tokens
				//triggerMinimote_button.trigger(this, triggerMinimote_button.getArgumentValues, remoteValue);

				triggerVisionFob_scene.trigger(this, remoteValue, null);
			}
		});
	}
}
module.exports = VisionFob;
