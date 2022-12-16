#!/bin/bash

set -ex

INCIDENT_ID=$(curl -XPOST -H "Content-Type: application/json" \
     -d '{"beganAt": "2022-12-16T12:17:18Z", "title": "Some hypervisors are broken", "impactType": {"slug": "performance_degration"}, "components": [{"slug": "hypervisor-00003"}, {"slug": "hypervisor-00004"}], "phase": {"slug": "working_on_it"}}' \
     127.0.0.1:5000/api/incidents | jq -r '.ID')


curl -XPATCH -H "Content-Type: application/json" \
     -d '{"title": "Some hypervisors are very broken", "impactType": {"slug": "performance_degration"}, "components": [{"slug": "hypervisor-00003"}, {"slug": "hypervisor-00002"}]}}' \
     127.0.0.1:5000/api/incidents/$INCIDENT_ID