
const CB_COLORBLIND = "colorBlindMode";
const CB_TABLE = "tableMode";
const CB_INCREASED_TEXT = "increasedTextSizeMode";

let themeColors = {}

let TextSizes = {
    Default: "",
    Increased: ""
}

function init() {
    // Retrieve the colors ordinarily used so that we can switch back to them
    // when leaving colorblind mode.
    let r = document.querySelector(":root");
    let styles = getComputedStyle(r);
    let colorNames = Array.from(styles).filter(name => name.startsWith("--") && name.endsWith("-color"));
    colorNames.forEach(name => themeColors[name] = styles.getPropertyValue(name));
    // Get text size info
    TextSizes.Default = styles.getPropertyValue("--default-text-size");
    TextSizes.Increased = styles.getPropertyValue("--increased-text-size");
    // Establish state of accessibility options
    if (document.cookie.match("AccessibilityColorblind=true")) {
        document.getElementById(CB_COLORBLIND).checked = true;
        switchColorMode();
    }
    if (document.cookie.match("AccessibilityIncreasedText=true")) {
        document.getElementById(CB_INCREASED_TEXT).checked = true;
        switchTextSize();
    }
    if (document.cookie.match("AccessibilityUseTable=true")) {
        document.getElementById(CB_TABLE).checked = true;
        switchApiDisplay();
    }
}

function switchColorMode() {
    let checkbox = document.getElementById(CB_COLORBLIND);
    if (checkbox.checked == true) {
        let r = document.querySelector(":root");
        r.style.setProperty("--maintenance-color", "#E1BE6A");
        r.style.setProperty("--fine-color", "#8CE05D");
        r.style.setProperty("--limited-color", "#5D3A9B");
        r.style.setProperty("--broken-color", "#D62C13");
        document.cookie = "AccessibilityColorblind=true";
        // Switch to colors for colorblind
    } else {
        // Re-establish ordinary colors
        let r = document.querySelector(":root");
        r.style.setProperty("--maintenance-color", themeColors["--maintenance-color"]);
        r.style.setProperty("--fine-color", themeColors["--fine-color"]);
        r.style.setProperty("--limited-color", themeColors["--limited-color"]);
        r.style.setProperty("--broken-color", themeColors["--broken-color"]);
        document.cookie = "AccessibilityColorblind=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
}

function switchTextSize() {
    let checkbox = document.getElementById(CB_INCREASED_TEXT);
    if (checkbox.checked) {
        let r = document.querySelector(":root");
        r.style.setProperty("--default-text-size", TextSizes.Increased);
        document.cookie = "AccessibilityIncreasedText=true";
    } else {
        let r = document.querySelector(":root");
        r.style.setProperty("--default-text-size", TextSizes.Default);
        document.cookie = "AccessibilityIncreasedText=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
}

function switchApiDisplay() {
    let checkbox = document.getElementById(CB_TABLE);
    let list = document.getElementById("api-list");
    let table = document.getElementById("api-table");
    if (checkbox.checked) {
        list.classList.add("hidden");
        table.classList.remove("hidden");
        document.cookie = "AccessibilityUseTable=true";
    } else {
        table.classList.add("hidden");
        list.classList.remove("hidden");
        document.cookie = "AccessibilityUseTable=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
}