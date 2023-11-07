#! /bin/bash

tsc ./*.ts;
node generate_csv.js;

rm ./*.js; 
rm ./*/*.js;