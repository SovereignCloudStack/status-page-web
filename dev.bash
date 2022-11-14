#!/bin/bash

set -ex

brew install tilt-dev/tap/tilt
brew install tilt-dev/tap/ctlptl

ctlptl create cluster kind --registry=ctlptl-registry

set +x

echo '----------------------------------'
echo 'do "tilt up" now'
echo '----------------------------------'
echo 'Example curl API call:'
cat <<EOF
curl -XPOST -H "Content-Type: application/json" \
     -d '{"title": "Some hypervisors are broken", "impactType": {"slug": "performance_degration"}, "components": [{"slug": "hypervisor-00003"}, {"slug": "hypervisor-00004"}], "phase": {"slug": "working_on_it"}}' \
     127.0.0.1:5000/incidents
EOF