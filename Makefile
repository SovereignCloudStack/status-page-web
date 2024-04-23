APP_NAME=status-page-web
HASH=$(shell git rev-parse --short HEAD)
CONTAINER_RUNTIME?=docker

.PHONY: all container container-push-harbor

all: container container-push-harbor

container:
	${CONTAINER_RUNTIME} build -t ${APP_NAME}:latest -t ${APP_NAME}:${HASH} -f Containerfile .

container-push-harbor:
	${CONTAINER_RUNTIME} tag ${APP_NAME}:${HASH} registry.scs.community/status-page/${APP_NAME}:${HASH}
	${CONTAINER_RUNTIME} tag ${APP_NAME}:latest registry.scs.community/status-page/${APP_NAME}:latest

	${CONTAINER_RUNTIME} push registry.scs.community/status-page/${APP_NAME}:${HASH}
	${CONTAINER_RUNTIME} push registry.scs.community/status-page/${APP_NAME}:latest
