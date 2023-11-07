#! /bin/bash

tsc ./*.ts
node parse_results.js;

rm ./*.js;
rm ./*/*.js;