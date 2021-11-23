#!/bin/sh
python3 pubsub-ant-hr-v2.py --topic arduino/incoming --root-ca ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key --endpoint a1mwyqxp9qxvre-ats.iot.us-east-1.amazonaws.com
