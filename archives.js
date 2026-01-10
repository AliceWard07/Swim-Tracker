/******************************
 * ARCHIVES PAGE JAVASCRIPT
 ******************************/

// Events list
const events = [
    "50 Free","100 Free","200 Free","400 Free","800 Free","1500 Free",
    "50 Breast","100 Breast","200 Breast",
    "50 Back","100 Back","200 Back",
    "50 Fly","100 Fly","200 Fly",
    "200 IM","400 IM"
];

// Detect LC or SC based on page file
const isLC = window.location.pathname.includes("ArchivesLC");
const course = isLC ? "LC" : "SC";

// Load user
let users = JSON.parse(localStorage.getItem("users")) || [];
let username = localStorage.getItem("username");
let user = users.find(u => u.Name === username);

if (!user) {
    alert("User not found — please log in again.");
    window.location.href = "login.html";
}

user.times = user.times || [];

/***************************************************
 * Populates the archive table with event → link
 ***************************************************/
function populateTable() {
    const tbody = document.getElementById("archiveTable");
    tbody.innerHTML = "";

    events.forEach(eventName => {
        const [distance, stroke] = eventName.split(" ");

        // Filter user's times for this event + course
        const eventTimes = user.times.filter(
            t => t.course === course &&
                 t.distance == distance &&
                 t.stroke === stroke
        );

        const tr = document.createElement("tr");

        // Event name
        const tdEvent = document.createElement("td");
        tdEvent.textContent = eventName;

        // Link cell
        const tdLink = document.createElement("td");

        if (eventTimes.length === 0) {
            tdLink.innerHTML = `<span style="color: gray;">No entries</span>`;
        } else {
            // Link to event.html for detailed view
            const a = document.createElement("a");
            a.textContent = "View Times";
            a.href = `event.html?distance=${distance}&stroke=${stroke}&course=${course}`;
            a.style.color = "blue";
            a.style.textDecoration = "underline";
            tdLink.appendChild(a);
        }

        tr.appendChild(tdEvent);
        tr.appendChild(tdLink);
        tbody.appendChild(tr);
    });
}

/***************************************************
 * Switch LC ⇄ SC button
 ***************************************************/
function switchCourse() {
    if (isLC) window.location.href = "archivesSC.html";
    else window.location.href = "archivesLC.html";
}

// Run on page load
populateTable();


