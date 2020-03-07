#!/bin/sh
set -e
cd "$(dirname "$0")"
rm -fr tmp
npm install
exec node -e 'require("./lib.js").librarify_papermc()'
