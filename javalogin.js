let loginEmailInput = document.getElementById("loginEmail");
let loginPasswordInput = document.getElementById("loginPassword");
let loginButton = document.getElementById("loginButton");

// Load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

function signIn() {
  let email = loginEmailInput.value.trim();
  let password = loginPasswordInput.value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  let user = users.find(u => u.Email === email && u.Password === password);

  if (user) {
    localStorage.setItem("username", user.Name);
    alert("Login successful!");
    window.location.href = "PB.html";
  } else {
    alert("Incorrect email or password.");
    clearForm();
  }
}

function clearForm() {
  loginEmailInput.value = "";
  loginPasswordInput.value = "";
}

loginButton.addEventListener("click", signIn);


