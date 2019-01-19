'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');
const lockSetting = {};

// http://products.z-wavealliance.org/ProductManual/File?folder=&filename=Manuals/2153/Aeon Labs WallMote Quad manual.pdf
// https://aeotec.freshdesk.com/helpdesk/attachments/6043650526

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		measure_battery: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: (report, node) => {
				if (node && typeof node.state.alarm_battery === 'undefined') {
					node.state.alarm_battery = false;
				}
				if (typeof report['Battery Level'] === 'string' && report['Battery Level'] === 'battery low warning') return 1;
				if (typeof report['Battery Level (Raw)'] !== 'undefined') return report['Battery Level (Raw)'][0];
				return null;
			},
		},
		alarm_battery: {
			command_class: 'COMMAND_CLASS_NOTIFICATION',
			command_report: 'NOTIFICATION_REPORT',
			command_report_parser: (report, node) => {
				if (report && report['Notification Type'] === 'Power Management') {
					if (node && report['Event'] === 13) Homey.manager('flow').triggerDevice('zw130_battery_full', null, null, node.device_data);
					if (report['Event'] === 15) return true;
					return false;
				}
				return null;
			}
		},
	},
	settings: {
		touch_sound: {
			index: 1,
			size: 1,
		},
		touch_vibration: {
			index: 2,
			size: 1,
		},
		slide_function: {
			index: 3,
			size: 1,
		},
		rgb_name: {
			index: 5,
			size: 4,
			parser: (newValue, newSettings, deviceData) => {
				if (newValue === 'custom' &&
					newSettings.hasOwnProperty('rgb_r') &&
					newSettings.hasOwnProperty('rgb_g') &&
					newSettings.hasOwnProperty('rgb_b')) {
					return new buffer([newSettings.rgb_r, newSettings.rgb_g, newSettings.rgb_b, 0]);
				}
				const value = newValue.split(',');
				const multiplier = newSettings.rgb_name_level / 100 || 1;

				setTimeout(() => {
					if (!lockSetting[deviceData.token]) {
						module.exports.setSettings(deviceData, {
							rgb_r: Math.round(value[0] * multiplier),
							rgb_g: Math.round(value[1] * multiplier),
							rgb_b: Math.round(value[2] * multiplier),
						}, err => {
							if (err) console.error(err);
						});
					}
				}, 300);

				return new Buffer([
					Math.round(value[0] * multiplier),
					Math.round(value[1] * multiplier),
					Math.round(value[2] * multiplier),
					0
				]);
			},
		},
		rgb_name_level: {
			index: 5,
			size: 4,
			parser: (newValue, newSettings, deviceData) => {
				if (newValue === 'custom' &&
					newSettings.hasOwnProperty('rgb_r') &&
					newSettings.hasOwnProperty('rgb_g') &&
					newSettings.hasOwnProperty('rgb_b')) {
					return new buffer([newSettings.rgb_r, newSettings.rgb_g, newSettings.rgb_b, 0]);
				}
				const value = newSettings.rgb_name.split(',') || [0,0,255];
				const multiplier = newValue / 100;

				setTimeout(() => {
					if (!lockSetting[deviceData.token]) {
						module.exports.setSettings(deviceData, {
							rgb_r: Math.round(value[0] * multiplier),
							rgb_g: Math.round(value[1] * multiplier),
							rgb_b: Math.round(value[2] * multiplier),
						}, err => {
							if (err) console.error(err);
						});
					}
				}, 300);

				return new Buffer([
					Math.round(value[0] * multiplier),
					Math.round(value[1] * multiplier),
					Math.round(value[2] * multiplier),
					0
				]);
			},
		},
		rgb_r: {
			index: 5,
			size: 4,
			parser: (newValue, newSettings, deviceData) => {
				lockSetting[deviceData.token] = true;
				setTimeout(() => {
					lockSetting[deviceData.token] = false;
					module.exports.setSettings(deviceData, {
						rgb_name: 'custom',
					}, err => {
						if (err) console.error(err);
					});
				}, 500);
				return new Buffer([newValue, newSettings.rgb_g, newSettings.rgb_b, 0]);
			},
		},
		rgb_g: {
			index: 5,
			size: 4,
			parser: (newValue, newSettings, deviceData) => {
				lockSetting[deviceData.token] = true;
				setTimeout(() => {
					lockSetting[deviceData.token] = false;
					module.exports.setSettings(deviceData, {
						rgb_name: 'custom',
					}, err => {
						if (err) console.error(err);
					});
				}, 500);
				return new Buffer([newSettings.rgb_r, newValue, newSettings.rgb_b, 0]);
			},
		},
		rgb_b: {
			index: 5,
			size: 4,
			parser: (newValue, newSettings, deviceData) => {
				lockSetting[deviceData.token] = true;
				setTimeout(() => {
					lockSetting[deviceData.token] = false;
					module.exports.setSettings(deviceData, {
						rgb_name: 'custom',
					}, err => {
						if (err) console.error(err);
					});
				}, 500);
				return new Buffer([newSettings.rgb_r, newSettings.rgb_g, newValue, 0]);
			},
		},
		low_battery: {
			index: 39,
			size: 1,
		},
	},
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE.on('report', (command, report) => {
			if (command.name === 'CENTRAL_SCENE_NOTIFICATION' &&
				report &&
				report.hasOwnProperty('Properties1') &&
				report.Properties1.hasOwnProperty('Key Attributes') &&
				report.hasOwnProperty('Scene Number')) {
				const wallmoteValue = {
					button: report['Scene Number'].toString(),
					scene: report.Properties1['Key Attributes']
				}
				Homey.manager('flow').triggerDevice('zw130_scene', null, wallmoteValue, node.device_data);
			}
		});
	}

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION !== 'undefined') {
		node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION.on('report', (command, report) => {
			if (command.name === 'CONFIGURATION_REPORT' &&
				report &&
				report.hasOwnProperty('Parameter Number') &&
				report.hasOwnProperty('Configuration Value')) {
				if (report['Parameter Number'] === 9) {
					const wallmoteValue = {
						button: report['Configuration Value'][0].toString(),
						scene: (report['Configuration Value'][1] === 1) ? 'Key Slide Up' : 'Key Slide Down'
					}
					Homey.manager('flow').triggerDevice('zw130_scene', null, wallmoteValue, node.device_data);
				}
				if (report['Parameter Number'] === 10) {
					let value = Math.round(report['Configuration Value'][2] / 2) / 100;
					if (value < 0.5) value = Math.max(value - 0.05, 0);
					const dimValue = {
						dim: value,
					}
					const wallmoteValue = {
						button: report['Configuration Value'][0].toString(),
					}
					Homey.manager('flow').triggerDevice('zw130_dim', dimValue, wallmoteValue, node.device_data);
				}
			}
		});
	}
});

Homey.manager('flow').on('trigger.zw130_scene', (callback, args, state) => {
	if (!args) return callback('arguments_error', false);
	if (!state) return callback('state_error', false);

	if(args.hasOwnProperty('button') &&
		args.hasOwnProperty('scene') &&
		state.hasOwnProperty('button') &&
		state.hasOwnProperty('scene') &&
		args.button === state.button &&
		args.scene === state.scene) {
		return callback(null, true);
	}
	return callback('unknown_error', false);
});

Homey.manager('flow').on('trigger.zw130_dim', (callback, args, state) => {
	if (!args) return callback('arguments_error', false);
	if (!state) return callback('state_error', false);

	if(args.hasOwnProperty('button') &&
		state.hasOwnProperty('button') &&
		args.button === state.button) {
		return callback(null, true);
	}
	return callback('unknown_error', false);
});
