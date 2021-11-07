#!/bin/sh
node dist/index_ant_plus_hr_v2.js --player1 53517 --player2 53643 --topic arduino/outgoing/HR --root-ca ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key --endpoint a1mwyqxp9qxvre-ats.iot.us-east-1.amazonaws.com
