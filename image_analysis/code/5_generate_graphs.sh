#! /bin/bash

tsc ./*.ts;
node generate_graphs.js;

rm ./*.js; 
rm ./*/*.js;