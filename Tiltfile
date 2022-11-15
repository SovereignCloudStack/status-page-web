load('ext://restart_process', 'docker_build_with_restart')

# statuspage api
local_resource(
    'api-binary',
    'cd status-page-api && CGO_ENABLED=0 go build -o ../build/statuspage-api *.go && cp *.yaml ../build/',
    deps=['status-page-api/']
)
docker_build_with_restart(
    'statuspage-api', './build',
    dockerfile='./status-page-api/Dockerfile.tilt',
    entrypoint=['/app/build/statuspage-api', '-addr=:4000', '-provisioning-file=/app/build/provisioning.yaml'],
    live_update=[
        sync('./build', '/app/build')
    ]
)

# statuspage web
# npm run dev does live updates
docker_build(
    'statuspage-web', '.',
    live_update=[
        sync('.', '/app')
    ]
)

k8s_yaml('k8s.yaml')

k8s_resource('statuspage', port_forwards=5000)