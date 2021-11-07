var Ant = require('../../ant-plus');

function openStick(stick, stickid, connection, argv) {
	var sensor1 = new Ant.HeartRateSensor(stick);

	var dev_id = 0;

	sensor1.on('hbdata', function(data) {
		console.log(stickid, 'sensor 1: ', data.DeviceID, data.ComputedHeartRate, data);
	        if (data.DeviceID == argv.player1) {	
			playerId = 1;
		} else {
			if (data.DeviceID == argv.player2) {
				playerId = 2;
			} else {
				playerId = 0;
			}
		}
		const msg = {
				id: playerId,
				value: data.ComputedHeartRate
		}
		const json = JSON.stringify(msg);
		connection.publish(argv.topic, json, aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce);
		setTimeout(function() {
			console.log('just published heartrate');
		},500);
		
		if (data.DeviceID !== 0 && dev_id === 0) {
			dev_id = data.DeviceID;
			console.log(stickid, 'detaching...');
			sensor1.detach();
			sensor1.once('detached', function() {
				sensor1.attach(0, dev_id);
			});
		}
	});

	sensor1.on('attached', function() { console.log(stickid, 'sensor1 attached'); });
	sensor1.on('detached', function() { console.log(stickid, 'sensor1 detached'); });

	var sensor2 = new Ant.StrideSpeedDistanceSensor(stick);

	sensor2.on('ssddata', function(data) {
		console.log(stickid, 'sensor 2: ', data.DeviceID, data);
	});

	sensor2.on('attached', function() { console.log(stickid, 'sensor2 attached'); });
	sensor2.on('detached', function() { console.log(stickid, 'sensor2 detached'); });

	var scanner = new Ant.HeartRateScanner(stick);

	scanner.on('hbdata', function(data) {
		console.log(stickid, 'scanner: ', data.DeviceID, data.ComputedHeartRate, data.Rssi, data);
	});

	scanner.on('attached', function() { console.log(stickid, 'scanner attached'); });
	scanner.on('detached', function() { console.log(stickid, 'scanner detached'); });

	stick.on('startup', function() {
		console.log(stickid, 'startup');

		console.log(stickid, 'Max channels:', stick.maxChannels);

		sensor1.attach(0, 0);

		setTimeout(function(data) {
			sensor2.attach(1, 0);
		}, 2000);

		setTimeout(function() {
			sensor1.once('detached', function() { sensor2.detach(); });
			sensor2.once('detached', function() {
				scanner.scan();
			});
			sensor1.detach();
		}, 5000);
	});

	stick.on('shutdown', function() { console.log(stickid, 'shutdown'); });

	function tryOpen(stick) {
		let token = stick.openAsync((err) => {
			token = null;
			if (err) {
				console.error(stickid, err);
			} else {
				console.log(stickid, 'Stick found');
				setTimeout(function() { stick.close(); }, 10000);
			}
		});

		setTimeout(function() { token && token.cancel(); }, 60000);

		return token;
	}

	tryOpen(stick);
}

"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_iot_device_sdk_v2_1 = require("aws-iot-device-sdk-v2");
const util_1 = require("util");
const yargs = require('yargs');
// The relative path is '../../util/cli_args' from here, but the compiled javascript file gets put one level
// deeper inside the 'dist' folder
const common_args = require('../../../util/cli_args');
yargs.command('*', false, (yargs) => {
    common_args.add_connection_establishment_arguments(yargs);
    common_args.add_pub_sub_arguments(yargs);
}, main).parse();
function execute_session(connection, argv) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const decoder = new util_1.TextDecoder('utf8');
                const on_publish = (topic, payload, dup, qos, retain) => __awaiter(this, void 0, void 0, function* () {
                    const json = decoder.decode(payload);
                    console.log(`Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
                    console.log(json);
                    const message = JSON.parse(json);
                    if (message.sequence == argv.count) {
                        resolve();
                    }
                });
                yield connection.subscribe(argv.topic, aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce, on_publish);
                openStick(new Ant.GarminStick2(), 1, connection, argv);

                for (let op_idx = 0; op_idx < argv.count; ++op_idx) {
                    const publish = () => __awaiter(this, void 0, void 0, function* () {
                        const msg = {
                            message: argv.message,
                            sequence: op_idx + 1,
                        };
                        const json = JSON.stringify(msg);
                        //connection.publish(argv.topic, json, aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce);
                    });
                    setTimeout(publish, op_idx * 1000);
                }
	        setTimeout(function() {
			console.log('get ant+ data here?');
			//openStick(new Ant.GarminStick2(), 1);
		}, 2900);
	    
	    }
            catch (error) {
                reject(error);
            }
        }));
    });
}
function main(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        common_args.apply_sample_arguments(argv);
        const connection = common_args.build_connection_from_cli_args(argv);
        // force node to wait 60 seconds before killing itself, promises do not keep node alive
        // ToDo: we can get rid of this but it requires a refactor of the native connection binding that includes
        //    pinning the libuv event loop while the connection is active or potentially active.
        const timer = setInterval(() => { }, 60 * 1000);
        yield connection.connect();
        yield execute_session(connection, argv);
        yield connection.disconnect();
        // Allow node to die if the promise above resolved
        clearTimeout(timer);
    });
}
//# sourceMappingURL=index.js.map
