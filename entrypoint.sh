#!/usr/bin/env sh
# -*- coding: utf-8 -*-
set -e

envsubst < /status-page/assets/config.tmpl.json > /status-page/assets/config.json

exec "$@"
