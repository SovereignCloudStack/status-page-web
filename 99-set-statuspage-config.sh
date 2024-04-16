#!/bin/sh

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

CONF_DIR="/usr/share/nginx/html/assets"
TEMP_FILE="$CONF_DIR/tmp.json"
CONF_FILE="$CONF_DIR/config.json"

# Write into a temp file first. Otherwise, the config file is getting truncated
# BEFORE it is being read by jq. This will, of course, result in an empty config file.
# Bad things happen then.
if [ -n "$SCS_SP_API_SERVER_URL" ]; then
    jq --arg SCS_SP_API_SERVER_URL "$SCS_SP_API_SERVER_URL" '.statusApiUrl = $SCS_SP_API_SERVER_URL' "$CONF_FILE" > "$TEMP_FILE"
    mv "$TEMP_FILE" "$CONF_FILE"
fi

if [ -n "$SCS_SP_USE_TEST_DATA" ]; then
    jq --arg SCS_SP_USE_TEST_DATA "$SCS_SP_USE_TEST_DATA" '.useTestData = $SCS_SP_USE_TEST_DATA' "$CONF_FILE" > "$CONF_DIR"/tmp.json
    mv "$TEMP_FILE" "$CONF_FILE"
fi
