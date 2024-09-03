# Overview

This repository supplies a SPA (Single Page Application), written in [Angular](https://angular.dev/), that uses the [`status-page-openapi` client](https://github.com/SovereignCloudStack/status-page-openapi/tree/main/lib/status-page-api/angular-client) to connect to the [API server](https://github.com/SovereignCloudStack/status-page-api) to show components, incidents and their impacts on the system. The SPA also offers a management page, allowing authorized users to create, update and delete incidents (including future incidents, the so-called maintenance events).

The SPA is released as a container running [nginx](https://nginx.org/) to serve the static build of the application. No other server components are needed to serve the application.
