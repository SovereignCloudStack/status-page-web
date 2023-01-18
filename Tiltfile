load('ext://restart_process', 'docker_build_with_restart')
load('ext://secret', 'secret_from_dict')

# statuspage api
local_resource(
    'api-binary',
    'cd status-page-githubprojects && CGO_ENABLED=0 go build -o ../build/statuspage-api *.go',
    deps=['status-page-githubprojects/']
)
docker_build_with_restart(
    'statuspage-api', './build',
    dockerfile='./status-page-api-tilt-Dockerfile',
    entrypoint=['/app/build/statuspage-api', "-addr=:4000"],
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
k8s_yaml(secret_from_dict("api-env", inputs={
    'GITHUB_TOKEN': os.getenv('GITHUB_TOKEN')
}))

k8s_resource('statuspage', port_forwards=5000)