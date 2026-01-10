// logout.js

function confirmLogout() {
    const confirmation = confirm("Are you sure you want to log out?");

    if (confirmation) {
        localStorage.removeItem("username");

        // Redirect after logout
        window.location.href = "login.html";
    }
}
