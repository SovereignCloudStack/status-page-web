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
    "statusApiUrl": "",
    // Number of days to retrieve data for
    "noOfDays": 90,
    // The date format used for most dates displayed on the page
    // All date formats use the formatting specified by dayjs: https://day.js.org/docs/en/display/format
    // The additional formatting specifiers from the AdvancedFormat plugin are also supported
    "dateFormat": "YYYY-MM-DD HH:mm:ss z",
    // The date format used for incident updates on the incident page
    "longDateFormat": "dddd, Do MMMM YYYY, HH:mm:ss z",
    // Mapping severity values to states and their associated colors
    "severities": {
        // Display name of the severity is used as the key
        "operational": {
            // Start value is explicit
            "start": 0,
            // End value
            "end": 25,
            // Normal mode color
            // Colors can be specified as in CSS
            "color": "#50c3a5",
            // Color to use for colorblind mode
            "colorblind": "#8ce05d"
        },
        "maintenance": {
            "start": 26,
            "end": 50,
            "color": "#50c3a5",
            "colorblind": "#e1be6a"
        },
        "limited": {
            "start": 51,
            "end": 75,
            "color": "#f5c451",
            "colorblind": "#5d3a9b"
        },
        "broken": {
            "start": 76,
            "end": 100,
            "color": "#ee6a5f",
            "colorblind": "#d62c13"
        }
    },
    // Backup color in case an unmapped severity value has been found
    "unknownColor": "lightsteelblue",
    // Use the test data included in the assets folder instead of querying
    // a status page API server. This setting is meant to simplyfy development
    // setups.
    "useTestData": false
}
```

If you use a in which there is only one API server with a static URL you already know, you can replace the API server URL with it. Either way, you will need to adapt the severity mapping to your setup. For an explanation of severity values, refer to [this documentation page](https://docs.scs.community/standards/scs-0402-v1-status-page-openapi-spec-decision#severity).

**Please note that the configuration file may still be subject to changes over the course of the preview stage.**

### Building the Image

Build the included `Dockerfile` using `docker` or `podman`. Use the resulting image as usual. You can define the environment variable `SCS_SP_API_SERVER_URL` to define the URL of the status API server the statuspage is supposed to use. Example using podman locally:

```sh
podman run -e SCS_SP_API_SERVER_URL="localhost:3000/status" -p 8080:8080 scs-status-page-web
```

There is also the `SCS_SP_USE_TEST_DATA` environment variable, which you can set to `true` to have the statuspage deliver the status example data included in its `src/assets/testdata` directory. This setting is obviously not meant to be used in production environments, but can be useful to check that the statuspage is running, even if no status API server is available.

**Important:** If you are running the status page technical preview in a way that requires you to have a valid imprint, you need to replace the example imprint in `src/app/imprint/imprint.component.html` with your actual imprint. A mechanism to do so automatically is being worked on.

## Developing

The status page is using Angular 2. The currently used version is **17.1**. This repository contains a devcontainer setup for VSCode. Using this is the simplest way to set up a development environment.

Once your environment has been set up, you have to customize the application configuration file. Either set the URL to the API server instance you will use or set `useTestData` to `true` to use the test data included under `src/assets/testdata`. Please note that you might have to adapt the datetime values in the included data to make them appear. A system to automatically do so is under consideration. Likewise, a system to separate development and production configuration files is in the works, but has not yet been added.

You can now start the development server using `ng serve` and start modifying the application.

To create a build, simply run `ng build` and check the resulting `dist` directory.

## HTML Prototype

The `html-prototype` directory contains a static HTML prototype for the page, based upon Mustache templates and incident data generated by a simple Python script. It gives an impression of how the site is supposed to look and handle once done.

