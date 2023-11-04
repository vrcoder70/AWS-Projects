#!/bin/bash

cd /home/ubuntu/app_tier/controller
node receiver_app_tier.js



cd /home/ubuntu/app_tier/classifier
image_name=$(find ./ -type f \( -iname \*.jpeg -o -iname \*.jpg -o -iname \*.png \))
python3 image_classification.py $image_name



cd /home/ubuntu/app_tier/controller
node sender_app_tier.js

