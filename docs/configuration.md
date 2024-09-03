# Configuration

The SPA expects a configuration file called `config.json` to be present in the `src/assets` folder. The very same folder also contains a template for this configuration file, called `config.tmpl.json`.

## Configuration File

The following table explains all settings available in the configuration file. Explanations for non-basic field types can be found below the table.

| Configuration Key                       | Description                                  | Type         | Default                                |
| --------------------------------------- | -------------------------------------------- | ------------ | -------------------------------------- |
| apiServerUrl                            | The URL of the API server supplying data     | String       | empty                                  |
| redirectUrl                             | URL you are being redirected to after Dex    | String       | empty                                  |
| dexUrl                                  | The URL of your Dex server                   | String       | empty                                  |
| dexId                                   | ID your application uses for Dex             | String       | empty                                  |
| noOfDays                                | Number of days to display incidents for.<br>Please note that we suggest not changing this. | number       | 90                                     |
| dateFormat                              | The format to use for dates displayed        | Format       | "YYYY-MM-DD HH:mm:ss z"                |
| longDateFormat                          | Long format for dates, including day names   | Format       | "dddd, Do MMMM YYYY, HH:mm:ss z"       |
| severities                              | Maps severities to colors to use             | JSON         | see below                              |
| unknownColor                            | Color to use for unknown severity values     | Color        | "lightsteelblue"                       |
| aboutText                               | Short text that appears in the ABout section | String       | empty                                  |

The `severities` map contains one entry for each severity level specified in the API server. The default configuration included in the template file looks like this:

```json5
"severities": {
    // Maintenance is a special case and uses only the severity value 0
    "maintenance": {
        "start": 0,
        "end": 0,
        "color": "#50c3a5",
        "colorblind": "#e1be6a"
    },
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
}
```

## Field Types

- **Format:** A format string using the [format specifiers](https://day.js.org/docs/en/display/format) provided by [Day.js](https://day.js.org/), including the ones provided by the `AdvancedFormat` plugin.
- **Color:** A string containing a color value, specified using CSS notation. Allows for color names, hex values using a leading `#` or the `rgb(...)` syntax.
- **JSON:** A JSON sub-object.