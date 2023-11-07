#! /bin/bash

tsc ./*.ts;
node export_results_to_csv.js;

rm ./*.js; 
