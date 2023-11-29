#! /bin/bash

tsc ./*.ts;
node generate_stats.js;

rm ./*.js; 
rm ./*/*.js;