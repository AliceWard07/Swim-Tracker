const params = new URLSearchParams(window.location.search);
const distance = params.get("distance");
const stroke = params.get("stroke");
const course = params.get("course"); // LC or SC


// Set event title
document.getElementById("eventTitle").innerText = `${distance} ${stroke} ${course} Archives`;


// Back button: return to proper archive page
function goBack() {
    if(course === "LC") window.location.href = "archivesLC.html";
    else window.location.href = "archivesSC.html";
}


// Get logged-in user
let username = localStorage.getItem("username");
if(!username) {
    alert("Please log in.");
    window.location.href="login.html";
}


let users = JSON.parse(localStorage.getItem("users")) || [];
let user = users.find(u => u.Name === username);
user.times = user.times || [];


// Filter times for this event
let eventTimes = user.times.filter(t =>
    t.distance === distance && t.stroke === stroke && t.course === course
);


// Populate table
const tbody = document.getElementById("eventTimesTable");


function renderTable(times) {
    tbody.innerHTML = "";
    times.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.time}</td>
            <td>${t.date}</td>
            <td>${t.happiness}</td>
            <td>${t.comment}</td>
        `;
        tbody.appendChild(tr);
    });
}


// Sorting
document.getElementById("sortSelect").addEventListener("change", () => {
    const sorted = sortTimes(eventTimes, document.getElementById("sortSelect").value);
    renderTable(sorted);
    updateCharts(sorted);
});


function sortTimes(times, sortBy) {
    const copy = [...times];
    switch(sortBy){
        case "TimeF-S": return copy.sort((a,b) => a.time.localeCompare(b.time));
        case "TimeS-F": return copy.sort((a,b) => b.time.localeCompare(a.time));
        case "DateN-O": return copy.sort((a,b) => new Date(b.date) - new Date(a.date));
        case "DateO-N": return copy.sort((a,b) => new Date(a.date) - new Date(b.date));
        case "HappinessH-L": return copy.sort((a,b) => b.happiness - a.happiness);
        case "HappinessL-H": return copy.sort((a,b) => a.happiness - b.happiness);
        default: return copy;
    }
}


// Initialize table
renderTable(eventTimes);


// Charts
let timeChart, happinessChart;


function updateCharts(times) {
    const labels = times.map(t => t.date);
    const timeData = times.map(t => convertTimeToSeconds(t.time));
    const happinessData = times.map(t => t.happiness);


    // Destroy previous charts
    if(timeChart) timeChart.destroy();
    if(happinessChart) happinessChart.destroy();


    const ctxTime = document.getElementById('timeChart').getContext('2d');
    timeChart = new Chart(ctxTime, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Time (seconds)', data: timeData, borderColor:'blue', fill:false }] },
        options: { responsive:true, plugins:{ legend:{ display:true } }, scales:{ y:{ beginAtZero:false } } }
    });


    const ctxHappiness = document.getElementById('happinessChart').getContext('2d');
    happinessChart = new Chart(ctxHappiness, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Happiness', data: happinessData, backgroundColor:'green' }] },
        options: { responsive:true, plugins:{ legend:{ display:true } }, scales:{ y:{ beginAtZero:true, max:10 } } }
    });
}


// Convert time string mm:ss or hh:mm:ss to total seconds
function convertTimeToSeconds(timeStr) {
    const parts = timeStr.split(":").map(Number);
    if(parts.length === 2) return parts[0]*60 + parts[1];
    if(parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    return 0;
}


// Initialize charts
updateCharts(eventTimes);


