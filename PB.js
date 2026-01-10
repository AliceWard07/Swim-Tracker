// PB.js (with sorting & course selection)

// Get logged-in username
let username = localStorage.getItem("username");
if (!username) {
    alert("Please log in.");
    window.location.href = "login.html";
}

// Load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

// Find current user (match the property 'Name' exactly)
let user = users.find(u => u.Name === username);
if (!user) {
    alert("User not found!");
    window.location.href = "login.html";
}

user.times = user.times || [];

// DOM elements
let tableBody = document.getElementById("pbTableBody");
let exportBtn = document.getElementById("exportCSV");
// Update title with user name
const pbTitle = document.getElementById("usernameDisplay");
pbTitle.textContent = `Personal Bests for ${user.Name}`;

// Sorting state
let currentSort = { key: null, ascending: true };

// Course filter (default LC)
let selectedCourse = "LC";

// Function to change course (call from dropdown on PB page)
window.setCourse = function(course) {
    selectedCourse = course;
    renderPB();
}

// Convert time to seconds for comparison
function timeToSeconds(t) {
    if (!t) return 0;
    t = t.toString().trim();

    if (t.includes(":")) {
        let parts = t.split(":").map(p => parseFloat(p) || 0);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    let dotParts = t.split('.').map(p => parseFloat(p) || 0);
    if (dotParts.length === 3) {
        return dotParts[0] * 3600 + dotParts[1] * 60 + dotParts[2];
    }

    let f = parseFloat(t);
    if (!isNaN(f)) return f;

    return 0;
}

// Get personal bests for each event, filtered by course
function getPersonalBests() {
    let bestMap = {};
    user.times.forEach(entry => {
        if (selectedCourse && entry.course !== selectedCourse) return; // filter by LC/SC

        let key = entry.stroke + "_" + entry.distance;
        let t = timeToSeconds(entry.time);
        if (!bestMap[key] || t < timeToSeconds(bestMap[key].time)) {
            bestMap[key] = entry;
        }
    });
    return Object.values(bestMap);
}

// Sorting function
function sortBestTimes(data) {
    if (!currentSort.key) return data;

    return data.sort((a, b) => {
        let valA, valB;

        switch(currentSort.key) {
            case "event":
                valA = `${a.distance} ${a.stroke}`.toLowerCase();
                valB = `${b.distance} ${b.stroke}`.toLowerCase();
                break;
            case "date":
                valA = a.date || "";
                valB = b.date || "";
                break;
            case "happiness":
                valA = parseFloat(a.happiness) || 0;
                valB = parseFloat(b.happiness) || 0;
                break;
            default:
                return 0;
        }

        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });
}

// Set sort column
function setSort(key) {
    if (currentSort.key === key) {
        currentSort.ascending = !currentSort.ascending; // toggle
    } else {
        currentSort.key = key;
        currentSort.ascending = true;
    }
    renderPB();
    updateSortIndicators();
}

// Update table header sort indicators
function updateSortIndicators() {
    const ths = document.querySelectorAll("#pbTable th.sortable");
    ths.forEach(th => {
        th.classList.remove("sorted-asc", "sorted-desc");
        if (th.textContent.toLowerCase() === currentSort.key) {
            th.classList.add(currentSort.ascending ? "sorted-asc" : "sorted-desc");
        }
    });
}

// Render table and chart
function renderPB() {
    tableBody.innerHTML = "";
    let bestTimes = getPersonalBests();
    bestTimes = sortBestTimes(bestTimes); // apply sorting

    bestTimes.forEach((entry) => {
        let tr = document.createElement("tr");

        let commentContent = entry.comments ? 
            `<a href="#" onclick="showComment('${encodeURIComponent(entry.comments)}'); return false;">View</a>` 
            : "-";

        tr.innerHTML = `
            <td>${entry.distance} ${entry.stroke}</td>
            <td>${entry.time}</td>
            <td>${entry.date}</td>
            <td>${entry.happiness || "-"}</td>
            <td>${commentContent}</td>
            <td>
                <button onclick="editEntry('${entry.stroke}', ${entry.distance})">Edit</button>
                <button onclick="deleteEntry('${entry.stroke}', ${entry.distance})">Delete</button>
            </td>
        `;

        tableBody.appendChild(tr);
    });

    updateChart(bestTimes);
}

// Show comment
function showComment(comment) {
    alert(decodeURIComponent(comment));
}

// Edit entry
window.editEntry = function(stroke, distance) {
    let entries = user.times.filter(e => e.stroke === stroke && e.distance == distance);
    if (!entries.length) return;
    let entry = entries.reduce((best, e) => timeToSeconds(e.time) < timeToSeconds(best.time) ? e : best, entries[0]);

    let newTime = prompt("Edit Time (HH:MM:SS or MM:SS or 28.32)", entry.time);
    if (newTime) entry.time = newTime;

    let newDate = prompt("Edit Date (YYYY-MM-DD)", entry.date);
    if (newDate) entry.date = newDate;

    let newComments = prompt("Edit Comments", entry.comments);
    if (newComments != null) entry.comments = newComments;

    let newHappiness = prompt("Edit Happiness (1-10)", entry.happiness);
    if (newHappiness) entry.happiness = newHappiness;

    saveAndRender();
}

// Delete entry
window.deleteEntry = function(stroke, distance) {
    if (!confirm("Delete this personal best?")) return;
    let bestIndex = user.times.reduce((bestIdx, e, i) => {
        if (e.stroke === stroke && e.distance == distance) {
            if (bestIdx === -1 || timeToSeconds(e.time) < timeToSeconds(user.times[bestIdx].time)) {
                return i;
            }
        }
        return bestIdx;
    }, -1);

    if (bestIndex !== -1) user.times.splice(bestIndex, 1);
    saveAndRender();
}

// Save and re-render
function saveAndRender() {
    localStorage.setItem("users", JSON.stringify(users));
    renderPB();
}

// Export CSV
if (exportBtn) {
    exportBtn.addEventListener("click", () => {
        let bestTimes = getPersonalBests();
        bestTimes = sortBestTimes(bestTimes);
        let csv = "Event,Time,Date,Happiness,Comments\n";
        bestTimes.forEach(e => {
            csv += `${e.distance} ${e.stroke},${e.time},${e.date},${e.happiness || "-"},${(e.comments || "-").replace(/\n/g, ' ')}\n`;
        });

        let blob = new Blob([csv], { type: "text/csv" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `${username}_PB.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });
}
// CHART RENDERING USING CHART.JS
let chartInstance = null;

// changing format to mm:ss
function formatSeconds(sec) {
    sec = Number(sec);
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    let sFormatted = s.toFixed(2).padStart(5, '0'); 
    return `${m}:${sFormatted}`;
}


// Render correct chart based on dropdown
window.renderSelectedChart = function() {
    let bestTimes = getPersonalBests();
    let type = document.getElementById("chartType").value;

    if (chartInstance) chartInstance.destroy();

    if (type === "time") renderTimeChart(bestTimes);
    else if (type === "happiness") renderHappinessChart(bestTimes);
    else if (type === "date") renderDateChart(bestTimes);
};

// TIME CHART – sorted from slowest → fastest
function renderTimeChart(data) {
    let ctx = document.getElementById("pbChart").getContext("2d");

    // Sort by time increasing
    data = [...data].sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));

    newChart(ctx, {
        labels: data.map(e => `${e.distance} ${e.stroke}`),
        values: data.map(e => timeToSeconds(e.time)),
        label: "Time (mm:ss)",
        yFormat: formatSeconds
    });
}

// HAPPINESS CHART
function renderHappinessChart(data) {
    let ctx = document.getElementById("pbChart").getContext("2d");
    data = [...data].sort((a, b) => (Number(a.happiness) || 0) - (Number(b.happiness) || 0));
    newChart(ctx, {
        labels: data.map(e => `${e.distance} ${e.stroke}`),
        values: data.map(e => Number(e.happiness) || 0),
        label: "Happiness (1–10)",
        yFormat: v => v
    });
}

// DATE CHART – chronological order
function renderDateChart(data) {
    let ctx = document.getElementById("pbChart").getContext("2d");

    // Sort chronologically
    data = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    newChart(ctx, {
        labels: data.map(e => `${e.distance} ${e.stroke}`),
        values: data.map(e => new Date(e.date).getTime()), // numeric timestamp
        label: "Date Achieved",
        yFormat: v => new Date(v).toLocaleDateString(),
        tooltipFormat: v => new Date(v).toLocaleDateString()
    });
}


// GENERIC CHART CREATOR
function newChart(ctx, config) {
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: config.labels,
            datasets: [{
                label: config.label,
                data: config.values,
                backgroundColor: "rgba(0, 122, 204, 0.5)",
                borderColor: "rgba(0, 122, 204, 0.9)",
                borderWidth: 2,
                hoverBackgroundColor: "rgba(0, 122, 204, 0.7)"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (config.tooltipFormat) return config.tooltipFormat(context.raw);
                            return context.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: config.yFormat
                    }
                }
            }
        }
    });
}


// Initial render
renderPB();

