# Status Page Web UI

This is the web UI for the SCS statuspage.

**This project is currently in the technical preview stage. Do not use in production.**

The status page is a simple web application that allows users to check if all services and components of a SCS installation are currently in a working state. Furthermore, it allows to read updates on ongoing and past incidents.

## Using the Status Page

To use the status page, you have to customize the configuration file and then create a container to use in your SCS setup.

### Prerequisites

Your SCS setup needs to include an instance of the [Status Page API server](https://github.com/SovereignCloudStack/status-page-api).

### Customizing the Configuration

You will find a configuration file named `config.json` in the `src/assets` directory. This file looks like this (sans comments, for the JSON gods abhor them):

```json5
{
    // The URL to the status page API server
    "apiServerUrl": "",
    // URL Dex redirects to after code retrieval
    "redirectUrl": "${STATUS_PAGE_REDIRECT_URL}",
    // URL to your Dex instance
    "dexUrl": "${STATUS_PAGE_DEX_URL}",
    // Your Dex ID
    "dexId": "${STATUS_PAGE_DEX_ID}",
    // Number of days to retrieve data for (we suggest not changing this)
    "noOfDays": 90,
    // The date format used for most dates displayed on the page
    // All date formats use the formatting specified by dayjs: https://day.js.org/docs/en/display/format
    // The additional formatting specifiers from the AdvancedFormat plugin are also supported
    "dateFormat": "YYYY-MM-DD HH:mm:ss z",
    // The date format used for incident updates on the incident page
    "longDateFormat": "dddd, Do MMMM YYYY, HH:mm:ss z",
    // Mapping severity values to states and their associated colors
    "severities": {
        // Maintenance is a special case with a hardcoded severity value of 0
        "maintenance": {
            "start": 0,
            "end": 0,
            "color": "#50c3a5",
            "colorblind": "#e1be6a"
        },
        // Display name of the severity is used as the key
        "operational": {
            // Start value is explicit
            "start": 1,
            // End value
            "end": 33,
            // Normal mode color
            // Colors can be specified as in CSS
            "color": "#50c3a5",
            // Color to use for colorblind mode
            "colorblind": "#8ce05d"
        },
        "limited": {
            "start": 34,
            "end": 66,
            "color": "#f5c451",
            "colorblind": "#5d3a9b"
        },
        "broken": {
            "start": 67,
            "end": 100,
            "color": "#ee6a5f",
            "colorblind": "#d62c13"
        }
    },
    // Backup color in case an unmapped severity value has been found
    "unknownColor": "lightsteelblue",
    // A short text to be displayed above the components
    "aboutText": "This is the status page for the SCS project. It displays incidents impacting any of the important components of this SCS stack."
}
```

If you use a development enfironment in which there is only one API server with a static URL you already know, you can replace the API server URL with it. Either way, you will need to adapt the severity mapping to your setup. For an explanation of severity values, refer to [this documentation page](https://docs.scs.community/standards/scs-0402-v1-status-page-openapi-spec-decision#severity).

**Please note that the configuration file may still be subject to changes over the course of the preview stage.**

### Building the Image

Build the included `Dockerfile` using `docker` or `podman`. Use the resulting image as usual. You can define the environment variable `STATUS_PAGE_WEB_API_URL` to define the URL of the status API server the statuspage is supposed to use. Example using podman locally:

```sh
podman run -e STATUS_PAGE_WEB_API_URL="localhost:3000/status" -p 8080:8080 scs-status-page-web
```

**Important:** If you are running the status page technical preview in a way that requires you to have a valid imprint, you need to replace the example imprint in `src/app/imprint/imprint.component.html` with your actual imprint. A mechanism to do so automatically is being worked on.

## Developing

The status page is using Angular 2. The currently used version is **17.1**. This repository contains a devcontainer setup for VSCode. Using this is the simplest way to set up a development environment.

We suggest using the local KinD deployment of our [status-page-deployment](https://github.com/SovereignCloudStack/status-page-deployment/) project to create a local development environment. It contains not only an API server, but also a Dex instance to allow for authorization against providers such as Github (though currently configured to do so for the SCS project on Github). The included reverse proxy makes the API server, Dex instance and other assorted pieces available under `api.localhost:8080`, `dex.localhost:8080`, etc.

Once your environment has been set up, you have to create and customize the `config.json` file in this repo. Copy the included `config.tmpl.json` and replace all variables with the proper values. If you're using our provided KinD deployment, these will be as follows:

```json5
"apiServerUrl": "http://api.localhost:8080",
"redirectUrl": "http://localhost:4200/login",
"dexUrl": "http://dex.localhost:8080",
"dexId": "status-page-web",
```

You will also have to modify the files of the KinD deployment itself as follows: 

- `kubernetes/environments/kind/api/api.env`
  - add `http://localhost:4200` to the `STATUS_PAGE_SERVER_ALLOWED_ORIGINS` variable, if not already in place.
- `kubernetes/environments/kind/dex/config.yaml`
  - add the property `allowedOrigins` to the `web` property with a single list entry: `http://localhost:4200`
- `a/kubernetes/environments/kind/web/web.env`
  - replace the value of `STATUS_PAGE_WEB_OIDC_REDIRECT_URI` with `http://localhost:4200/login`

Follow the README of the deployment project to start the KinD environment.

You can now start the development server using `ng serve` and start modifying the application.

To create a build, simply run `ng build` and check the resulting `dist` directory.

## HTML Prototype

The `html-prototype` directory contains a static HTML prototype for the page, based upon Mustache templates and incident data generated by a simple Python script. It gives an impression of how the site is supposed to look and handle once done.

