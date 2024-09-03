# Contribute

To start developing for the status page web frontend, start by cloning [the repo](https://github.com/SovereignCloudStack/status-page-web). Remember to run `git submodule update --init` afterwards to also retrieve the OpenAPI client included in the sources.

Now you should follow [the Quickstart guide](https://docs.scs.community/docs/operating-scs/components/status-page-deployment/docs/quickstart) of the `status-page-deployment` repo and deploy and configure a local kind environment. You can then modify your hosts file to re-route requests to the available components:

```127.0.0.1   api.localhost dex.localhost oathkeeper.localhost web.localhost monitoring.localhost```

You can now copy the configuration file template and set the `apiServerUrl` and `dexUrl` properties to `http://api.localhost:8080` and `http://dex.localhost:8080`, respectively. Set your `dexId` to `status-page-web` and the `redirectUrl` to `http://localhost:4200/login`.

You are now ready to run `npm install` to retrieve all dependencies. Afterwards, you can start the application locally by running `ng serve`. The status page will be available under `localhost:4200`.

This repo also contains [Devcontainer files for Visual Studio Code](https://code.visualstudio.com/docs/devcontainers/containers) and we suggest using this to quickly set up your development environment.