#!/bin/sh
set -e
cd "$(dirname "$0")"
npm install
exec node -e 'require("./lib.js").make_files_list()'
