'use strict';
const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// https://products.z-wavealliance.org/products/1284

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === 'battery low warning') return 1;
				if (report.hasOwnProperty('Battery Level (Raw)')) return report['Battery Level (Raw)'][0];
				return null;
			},
			pollInterval: 'poll_interval',
		}
	}
});

const triggerMap = {
	1: 'press_1',
	2: 'hold_1'
};

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];
	if (node) {
		node.instance.CommandClass['COMMAND_CLASS_SCENE_ACTIVATION'].on('report', (command, report) => {
			if (command.name === 'SCENE_ACTIVATION_SET') {
				const triggerId = triggerMap[report['Scene ID']];
				if (triggerId) Homey.manager('flow').triggerDevice(`dsa38_${triggerId}`, null, null, node.device_data);
			}
		});
	}
});
