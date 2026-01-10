// badges.js

// Load user
let username = localStorage.getItem("username");
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = users.find(u => u.Name === username);

if (!currentUser) {
    alert("Please log in.");
    window.location.href = "login.html";
}

currentUser.times = currentUser.times || [];
currentUser.badges = currentUser.badges || [];

// Badge definitions
const badgeDefinitions = [
    {
        id: "first_time",
        name: "First Time!",
        description: "Logged your first swim time",
        condition: user => user.times.length >= 1,
        img: "https://img.icons8.com/color/96/000000/trophy.png"
    },
    {
        id: "10_times",
        name: "10 Times Logged",
        description: "Logged 10 swim times",
        condition: user => user.times.length >= 10,
        img: "https://img.icons8.com/color/96/000000/medal.png"
    },
    {
        id: "20_times",
        name: "20 Times Logged",
        description: "Logged 20 swim times",
        condition: user => user.times.length >= 20,
        img: "https://img.icons8.com/color/96/000000/medal.png"
    },
    {
        id: "30_times",
        name: "30 Times Logged",
        description: "Logged 30 swim times",
        condition: user => user.times.length >= 30,
        img: "https://img.icons8.com/color/96/000000/medal.png"
    },
    {
        id: "first_pb",
        name: "First PB!",
        description: "Achieved your first personal best",
        condition: user => {
            return calculatePBCount(user) >= 1;
        },
        img: "https://img.icons8.com/color/96/000000/trophy.png"
    },
    {
        id: "5_pbs",
        name: "5 Personal Bests",
        description: "Achieved 5 personal bests",
        condition: user => calculatePBCount(user) >= 5,
        img: "https://img.icons8.com/color/96/000000/star--v1.png"
    },
    {
        id: "10_pbs",
        name: "10 Personal Bests",
        description: "Achieved 10 personal bests",
        condition: user => calculatePBCount(user) >= 10,
        img: "https://img.icons8.com/color/96/000000/diamond.png"
    }
];

// Convert time string to seconds
function parseTime(timeStr) {
    if (!timeStr) return Infinity;
    timeStr = timeStr.toString().trim();

    // mm:ss or hh:mm:ss
    if (timeStr.includes(":")) {
        let parts = timeStr.split(":").map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    // X.Y.Z
    let dotParts = timeStr.split(".").map(Number);
    if (dotParts.length === 3) return dotParts[0] * 60 + dotParts[1] + dotParts[2] / 100;

    return parseFloat(timeStr) || Infinity;
}

// Count personal bests per stroke-distance group
function calculatePBCount(user) {
    let bestMap = {};

    user.times.forEach(entry => {
        let key = entry.stroke + "_" + entry.distance;
        let t = parseTime(entry.time);
        if (!bestMap[key] || t < parseTime(bestMap[key].time)) {
            bestMap[key] = entry;
        }
    });

    return Object.keys(bestMap).length;
}

// Award badges
function updateBadges() {
    badgeDefinitions.forEach(badge => {
        if (!currentUser.badges.includes(badge.id) && badge.condition(currentUser)) {
            currentUser.badges.push(badge.id);
        }
    });

    localStorage.setItem("users", JSON.stringify(users));
}

// Display badges in your HTML badgeGrid
function displayBadges() {
    const grid = document.getElementById("badgeGrid");
    grid.innerHTML = "";

    badgeDefinitions.forEach(badge => {
        const earned = currentUser.badges.includes(badge.id);

        const badgeEl = document.createElement("div");
        badgeEl.className = "badge " + (earned ? "earned" : "unearned");

        badgeEl.innerHTML = `
            <img src="${badge.img}">
            <h3>${badge.name}</h3>
            <p>${badge.description}</p>
        `;

        grid.appendChild(badgeEl);
    });
}

// Run update + render
updateBadges();
displayBadges();

