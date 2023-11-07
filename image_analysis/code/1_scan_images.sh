#! /bin/bash

tsc ./*.ts;
node analyze_images.js;

rm ./*.js; 
rm ./*/*.js;