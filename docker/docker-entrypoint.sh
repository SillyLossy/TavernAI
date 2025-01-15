#!/bin/sh

if [ ! -e "config/config.yaml" ]; then
    echo "Resource not found, copying from defaults: config.yaml"
    cp -r "default/config.yaml" "config/config.yaml"
fi

# Start the server
#exec node server.js --listen "$@" --whitelist false
exec node server.js --whitelist false
