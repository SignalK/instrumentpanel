#!/bin/sh

node_modules/.bin/watchify -t reactify lib/ui/main.js -o dist/ui.js --debug --verbose
