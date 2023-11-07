#! /bin/bash

tsc ./*.ts;
node analyze_images.js --images=no_latest.json;

rm ./*.js; 
rm ./*/*.js;