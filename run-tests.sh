#!/bin/bash

export BROWSER_NAME='chrome'

./node_modules/.bin/http-server --silent &
node test/integration/runner
