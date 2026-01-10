// DOM elements
let courseType = document.getElementById("courseType");
let strokeSelect = document.getElementById("stroke");
let distanceSelect = document.getElementById("distance");
let swimTimeInput = document.getElementById("swimTime");
let swimDateInput = document.getElementById("swimDate");
let commentsInput = document.getElementById("comments");
let happinessInput = document.getElementById("happiness");
let saveButton = document.getElementById("saveButton");
let suggestionDiv = document.getElementById("suggestion");

// Load users
let users = JSON.parse(localStorage.getItem("users")) || [];
let username = localStorage.getItem("username");

// FIX: Use 'Name' as stored in signup
let currentUser = users.find(u => u.Name === username);

if (!currentUser) {
    alert("Error: No logged-in user found.");
    window.location.href = "login.html";
}

currentUser.times = currentUser.times || [];

// Comment analysis
function analyzeComment(comment) {
    comment = comment.toLowerCase();
    if(comment.includes("tired") || comment.includes("exhausted")) {
        return "Your tiredness suggests you may need a better night's sleep before racing. Also, make sure you are recovering properly between races.";
    }
    if(comment.includes("strong finish")) {
        return "Your comments about a strong finish indicate good endurance. Keep training consistently!";
    }
    if(comment.includes("weak finish") || comment.includes("slow finish")) {
        return "A slow finish might indicate endurance issues or mispacing. Consider endurance sets and race-pace practice.";
    }
    if(comment.includes("slow start") || comment.includes("bad finish")) {
        return "Consider working on your reaction time off the blocks and front-end pace in training.";
    }
    if(comment.includes("slow turns") || comment.includes("bad turns") || comment.includes("bad turn")) {
        return "Practice turns and underwater work off the walls to improve turns.";
    }
    if(comment.includes("technique") || comment.includes("stroke")) {
        return "Video analysis or technique drills recommended.";
    }
    return "Keep training consistently and track your times!";
}

// Show suggestion on comment blur
commentsInput.addEventListener("blur", () => {
    let comment = commentsInput.value;
    if(comment.trim() !== "") {
        suggestionDiv.textContent = "Suggestion: " + analyzeComment(comment);
    } else {
        suggestionDiv.textContent = "";
    }
});

// Validate swim time format
function validateSwimTime(time) {
    const pattern = /^(\d+:\d{2}\.\d{2}|\d+\.\d{2}\.\d{2}|\d{1,2}:\d{2}|\d+\.\d{2}|\d+)$/;
    return pattern.test(time.trim());
}

// Save time
function saveTime() {
    let course = courseType.value;
    let stroke = strokeSelect.value;
    let distance = distanceSelect.value;
    let time = swimTimeInput.value.trim();
    let date = swimDateInput.value;
    let comments = commentsInput.value.trim();
    let happiness = happinessInput.value;

    if(!time || !date) {
        alert("Please enter both time and date.");
        return;
    }

    if(!validateSwimTime(time)) {
        alert("Invalid time format. Use formats like 28.32 or 1:02.45 or 1.02.45");
        return;
    }

    let entry = { 
        course,      // ← FIX ADDED
        stroke, 
        distance, 
        time, 
        date, 
        comments, 
        happiness 
    };

    currentUser.times.push(entry);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Time saved successfully!");
    clearForm();
}


// Clear form
function clearForm() {
    courseType.value = "LC";
    strokeSelect.value = "Freestyle";
    distanceSelect.value = "50";
    swimTimeInput.value = "";
    swimDateInput.value = "";
    commentsInput.value = "";
    happinessInput.value = "";
}

// Event listener
saveButton.addEventListener("click", saveTime);

