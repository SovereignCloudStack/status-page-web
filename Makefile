APP_NAME=status-page-web
HASH=$(shell git rev-parse --short HEAD)

CONTAINER_RUNTIME := $(shell command -v docker 2> /dev/null)
ifndef CONTAINER_RUNTIME
CONTAINER_RUNTIME := $(shell command -v podman 2> /dev/null)
endif

.PHONY: all container container-push-harbor

all: container container-push-harbor

container: guard-container-cmd
	${CONTAINER_RUNTIME} build -t ${APP_NAME}:latest -t ${APP_NAME}:${HASH} -f Containerfile .

container-push-harbor: guard-container-cmd
	${CONTAINER_RUNTIME} tag ${APP_NAME}:${HASH} registry.scs.community/status-page/${APP_NAME}:${HASH}
	${CONTAINER_RUNTIME} tag ${APP_NAME}:latest registry.scs.community/status-page/${APP_NAME}:latest

	${CONTAINER_RUNTIME} push registry.scs.community/status-page/${APP_NAME}:${HASH}
	${CONTAINER_RUNTIME} push registry.scs.community/status-page/${APP_NAME}:latest


# Check, if the CONTAINER_RUNTIME variable is set
guard-container-cmd:
	@if [ "${CONTAINER_RUNTIME}" = "" ]; then \
		echo "Either DOCKER or PODMAN must be installed"; \
		exit 1; \
	fi
