repo = local_git_repo('.')

k8s_yaml('k8s.yaml')

docker_build(
    'statuspage', '.',
    live_update=[
        sync('.', '/app')
    ]
)

k8s_resource('statuspage', port_forwards=5000)