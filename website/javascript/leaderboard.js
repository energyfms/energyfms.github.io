// EnergyFM Dynamic Leaderboard Table Configuration

// 1. UTILITY: Convert raw CSV text into a JSON array
function parseCSVToJSON(csvText) {
    const lines = csvText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, '').trim());

    return lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.replace(/^["']|["']$/g, '').trim());
        const rowObject = {};
        headers.forEach((header, index) => {
            const val = values[index];
            rowObject[header] = (val !== undefined && val !== "" && !isNaN(val)) ? parseFloat(val) : val;
        });
        return rowObject;
    });
}

// 2. STYLING: Shared color gradient heatmap helper
var applyHeatmapColor = function (cell, value, min, max, baseColor, invert) {
    var percent = (value - min) / (max - min);
    percent = Math.max(0, Math.min(1, percent));
    if (invert) percent = 1 - percent;

    var startColor = { r: 255, g: 255, b: 255 };

    var r = Math.round(startColor.r + percent * (baseColor.r - startColor.r));
    var g = Math.round(startColor.g + percent * (baseColor.g - startColor.g));
    var b = Math.round(startColor.b + percent * (baseColor.b - startColor.b));

    cell.getElement().style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    cell.getElement().style.fontWeight = "600";
};

// Lower-is-better error formatter (used for forecasting OOD/ID error columns)
var errorColorFormatter = function (cell, formatterParams) {
    var value = cell.getValue();
    if (value === "-" || value === null || value === undefined || isNaN(value)) return value;

    var baseBlueGray = { r: 182, g: 206, b: 226 };
    var min = formatterParams.min !== undefined ? formatterParams.min : 20;
    var max = formatterParams.max !== undefined ? formatterParams.max : 120;

    // Lower error = darker/better, so invert the gradient
    applyHeatmapColor(cell, value, min, max, baseBlueGray, true);
    return parseFloat(value).toFixed(2);
};

// Higher-is-better score formatter (used for Anomaly Detection)
var anomalyScoreFormatter = function (cell, formatterParams) {
    var value = cell.getValue();
    if (value === "-" || value === null || value === undefined || isNaN(value)) return value;

    // Distinct warm Amber/Bronze palette
    var baseBronze = { r: 232, g: 197, b: 151 };
    var min = formatterParams.min !== undefined ? formatterParams.min : 0.3;
    var max = formatterParams.max !== undefined ? formatterParams.max : 0.9;

    applyHeatmapColor(cell, value, min, max, baseBronze, false);
    return parseFloat(value).toFixed(4);
};

// Higher-is-better score formatter (used for Appliance Classification)
var classificationScoreFormatter = function (cell, formatterParams) {
    var value = cell.getValue();
    if (value === "-" || value === null || value === undefined || isNaN(value)) return value;

    // Distinct Teal/Emerald palette
    var baseTeal = { r: 164, g: 214, b: 202 };
    var min = formatterParams.min !== undefined ? formatterParams.min : 0.3;
    var max = formatterParams.max !== undefined ? formatterParams.max : 0.9;

    applyHeatmapColor(cell, value, min, max, baseTeal, false);
    return parseFloat(value).toFixed(4);
};

// 3. Dynamic tier-badge generator for model classifications
var modelBadgeFormatter = function (cell) {
    var rawValue = cell.getValue();
    var category = cell.getData().category ? cell.getData().category.trim() : "";

    // Automatically strip out any bracketed suffixes like " (Transfer)" or " (Zero-shot)"
    var cleanValue = rawValue ? rawValue.replace(/\s*\(.*\)$/, "").trim() : "";

    // Map your cleaned name to the repository links
    var repoLinks = {
        "Energy-TTM": "https://huggingface.co/sriv-naman-iisc/Energy-FM-v1",
        "Energy-TSPulse": "https://huggingface.co/sriv-naman-iisc/Energy-FM-v1",
        "TTM": "https://github.com/ibm-granite/granite-tsfm",
        "PatchTST": "https://github.com/ibm-granite/granite-tsfm",
        "TimesFM": "https://github.com/google-research/timesfm",
        "Moirai": "https://github.com/SalesforceAIResearch/uni2ts",
        "Lag-Llama": "https://github.com/time-series-foundation-models/lag-llama",
        "MOMENT": "https://github.com/moment-timeseries-foundation-model/moment",
        "TSPulse": "https://github.com/ibm-granite/granite-tsfm",
        "UniTS": "https://github.com/mims-harvard/UniTS",
        "TimeGPT": "https://github.com/Nixtla/nixtla",
        "LightGBM": "https://github.com/lightgbm-org/LightGBM",
        "Auto-ARIMA": "https://github.com/Nixtla/statsforecast",
        "Arsenal": "https://github.com/aeon-toolkit/aeon",
        "MiniRocket": "https://github.com/angus95/minirocket",
        "TimeSeriesForest": "https://github.com/aeon-toolkit/aeon",
        "RISE": "https://github.com/aeon-toolkit/aeon",
        "KNNeucli": "https://github.com/aeon-toolkit/aeon",
        "cBOSS": "https://github.com/aeon-toolkit/aeon"
    };

    var targetUrl = repoLinks[cleanValue] || "#";

    var badge = "";
    if (category === "Zero-Shot") {
        badge = '<span style="background: #659bd7ff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 8px; font-weight: bold; display: inline-block;">ZERO-SHOT</span>';
    } else if (category === "Transfer Learning") {
        badge = '<span style="background: #8a6fc2ff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 8px; font-weight: bold; display: inline-block;">TRANSFER</span>';
    } else if (category === "Task-Specific") {
        badge = '<span style="background: #de8888ff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 8px; font-weight: bold; display: inline-block;">TASK</span>';
    } else if (category === "Baseline") {
        badge = '<span style="background: #7ac292ff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 8px; font-weight: bold; display: inline-block;">BASE</span>';
    }

    // Render the table cell using the clean value instead of the raw value
    if (targetUrl !== "#") {
        return badge + `<a href="${targetUrl}" target="_blank" style="color: #1a365d; font-weight: 600; text-decoration: none; border-bottom: 1px dashed #1a365d;" onmouseover="this.style.color='#659bd7ff'" onmouseout="this.style.color='#1a365d'">${cleanValue}</a>`;
    } else {
        return badge + cleanValue;
    }
};

// 4. CORE EXECUTOR: Render tables with EnergyFM data endpoints and DOM elements
document.addEventListener('DOMContentLoaded', function () {

    // --- 1a. FORECASTING: COMMERCIAL BUILDINGS ---
    fetch('website/data/efm_forecasting_comm.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSVToJSON(csvText);
            new Tabulator("#forecasting-commercial-table", {
                data: data,
                layout: "fitColumns",
                initialSort: [{ column: "OOD", dir: "asc" }],
                columns: [
                    { title: "Model", field: "model", frozen: true, minWidth: 170, formatter: modelBadgeFormatter },
                    { title: "OOD Error", field: "OOD", sorter: "number", hozAlign: "center", headerHozAlign: "center", formatter: errorColorFormatter, formatterParams: { min: 20, max: 115 } },
                    { title: "ID Error", field: "ID", sorter: "number", hozAlign: "center", headerHozAlign: "center", formatter: errorColorFormatter, formatterParams: { min: 20, max: 115 } }
                ]
            });
        }).catch(err => console.error('Error fetching commercial forecasting table:', err));

    // --- 1b. FORECASTING: RESIDENTIAL BUILDINGS ---
    fetch('website/data/efm_forecasting_res.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSVToJSON(csvText);
            new Tabulator("#forecasting-residential-table", {
                data: data,
                layout: "fitColumns",
                initialSort: [{ column: "OOD", dir: "asc" }],
                columns: [
                    { title: "Model", field: "model", frozen: true, minWidth: 170, formatter: modelBadgeFormatter },
                    { title: "OOD Error", field: "OOD", sorter: "number", hozAlign: "center", headerHozAlign: "center", formatter: errorColorFormatter, formatterParams: { min: 55, max: 105 } },
                    { title: "ID Error", field: "ID", sorter: "number", hozAlign: "center", headerHozAlign: "center", formatter: errorColorFormatter, formatterParams: { min: 55, max: 110 } }
                ]
            });
        }).catch(err => console.error('Error fetching residential forecasting table:', err));

    // --- 2. ANOMALY DETECTION LEADERBOARD ---
    fetch('website/data/efm_anomaly.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSVToJSON(csvText);
            new Tabulator("#anomaly-table", {
                data: data,
                layout: "fitColumns",
                responsiveLayout: false,
                pagination: false,
                height: "auto",
                initialSort: [{ column: "f1_score", dir: "desc" }],
                columns: [
                    { title: "Model", field: "model", frozen: true, minWidth: 200, formatter: modelBadgeFormatter },
                    { title: "Precision", field: "precision", hozAlign: "center", headerHozAlign: "center", formatter: anomalyScoreFormatter, formatterParams: { min: 0.29, max: 0.84 } },
                    { title: "Recall", field: "recall", hozAlign: "center", headerHozAlign: "center", formatter: anomalyScoreFormatter, formatterParams: { min: 0.29, max: 0.92 } },
                    { title: "F1 Score", field: "f1_score", hozAlign: "center", headerHozAlign: "center", formatter: anomalyScoreFormatter, formatterParams: { min: 0.28, max: 0.83 } }
                ]
            });
        }).catch(err => console.error('Error fetching anomaly leaderboard:', err));

    // --- 3. APPLIANCE CLASSIFICATION LEADERBOARD ---
    fetch('website/data/efm_classification.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSVToJSON(csvText);
            new Tabulator("#classification-table", {
                data: data,
                layout: "fitColumns",
                responsiveLayout: false,
                pagination: false,
                height: "auto",
                initialSort: [{ column: "f1_score", dir: "desc" }],
                columns: [
                    { title: "Model", field: "model", frozen: true, minWidth: 200, formatter: modelBadgeFormatter },
                    { title: "Precision", field: "precision", hozAlign: "center", headerHozAlign: "center", formatter: classificationScoreFormatter, formatterParams: { min: 0.39, max: 0.85 } },
                    { title: "Recall", field: "recall", hozAlign: "center", headerHozAlign: "center", formatter: classificationScoreFormatter, formatterParams: { min: 0.50, max: 0.82 } },
                    { title: "F1 Score", field: "f1_score", hozAlign: "center", headerHozAlign: "center", formatter: classificationScoreFormatter, formatterParams: { min: 0.44, max: 0.80 } }
                ]
            });
        }).catch(err => console.error('Error fetching classification leaderboard:', err));
});