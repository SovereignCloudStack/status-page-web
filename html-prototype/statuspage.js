
const CB_COLORBLIND = "colorBlindMode";
const CB_TABLE = "tableMode";
const CB_TABLE_HIDE_FINE = "tableHideFineDays";
const CB_INCREASED_TEXT = "increasedTextSizeMode";

const LBL_TABLE_HIDE_FINE = "tableHideFineDaysLabel";

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
    if (document.cookie.match("AccessibilityTableHideFine=true")) {
        document.getElementById(CB_TABLE).checked = true;
        switchTableHideOperationalDays();
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
        document.cookie = "AccessibilityColorblind=true; SameSite=Strict";
        // Switch to colors for colorblind
    } else {
        // Re-establish ordinary colors
        let r = document.querySelector(":root");
        r.style.setProperty("--maintenance-color", themeColors["--maintenance-color"]);
        r.style.setProperty("--fine-color", themeColors["--fine-color"]);
        r.style.setProperty("--limited-color", themeColors["--limited-color"]);
        r.style.setProperty("--broken-color", themeColors["--broken-color"]);
        document.cookie = "AccessibilityColorblind=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    }
}

function switchTextSize() {
    let checkbox = document.getElementById(CB_INCREASED_TEXT);
    if (checkbox.checked) {
        let r = document.querySelector(":root");
        r.style.setProperty("--default-text-size", TextSizes.Increased);
        document.cookie = "AccessibilityIncreasedText=true; SameSite=Strict";
    } else {
        let r = document.querySelector(":root");
        r.style.setProperty("--default-text-size", TextSizes.Default);
        document.cookie = "AccessibilityIncreasedText=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    }
}

function switchApiDisplay() {
    let checkbox = document.getElementById(CB_TABLE);
    let list = document.getElementById("api-list");
    let table = document.getElementById("api-table");
    let hide = document.getElementById(CB_TABLE_HIDE_FINE);
    if (checkbox.checked) {
        list.classList.add("hidden");
        table.classList.remove("hidden");
        enableTableHide(true);
        document.cookie = "AccessibilityUseTable=true; SameSite=Strict";
    } else {
        table.classList.add("hidden");
        list.classList.remove("hidden");
        enableTableHide(false);
        document.cookie = "AccessibilityUseTable=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    }
}

function enableTableHide(enabled) {
    let hide = document.getElementById(CB_TABLE_HIDE_FINE);
    let label = document.getElementById(LBL_TABLE_HIDE_FINE);
    hide.disabled = !enabled;
    if (enabled) {
        label.classList.remove("disabled");
    } else {
        label.classList.add("disabled");
    }
}

function switchTableHideOperationalDays() {
    let tableEnabled = document.getElementById(CB_TABLE).checked;
    let checkbox = document.getElementById(CB_TABLE_HIDE_FINE);
    let table = document.getElementById("api-table");
    if (tableEnabled) {
        if (checkbox.checked) {
            elements = table.getElementsByClassName("marker-fine");
            for (i = 0; i < elements.length; i++) {
                elements[i].classList.add("hidden");
            }
            document.cookie = "AccessibilityTableHideFine=true; SameSite=Strict";
        } else {
            elements = table.getElementsByClassName("marker-fine");
            for (i = 0; i < elements.length; i++) {
                elements[i].classList.remove("hidden");
            }
            document.cookie = "AccessibilityTableHideFine=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
        }
    }
}