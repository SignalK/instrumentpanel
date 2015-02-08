#!/bin/sh

watchify -t reactify lib/ui/main.js -o dist/ui.js --debug --verbose
