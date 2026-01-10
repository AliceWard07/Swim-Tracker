let NameInput = document.getElementById("Name");
let EmailInput = document.getElementById("Email");
let PasswordInput = document.getElementById("Password");
let Button = document.getElementById("Button");

let users = JSON.parse(localStorage.getItem("users")) || [];

function signUp() {
  let Name = NameInput.value.trim();
  let Email = EmailInput.value.trim();
  let Password = PasswordInput.value;

  if (!Name || !Email || !Password) {
    alert("Please fill in all fields.");
    return;
  }

  if (users.some(u => u.Email === Email)) {
    alert("Email already in use.");
    return;
  }

  if (!ValidEmail(Email)) {
    alert("Invalid email format.");
    return;
  }

  if (!ValidPassword(Password)) {
    alert("Password must be at least 8 characters and include 2 numbers.");
    return;
  }

  let user = { Name, Email, Password, times: [] };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful!");
  clearForm();

  window.location.href = "login.html";
}

function ValidEmail(email) {
  return email.includes("@") && email.includes(".");
}

function ValidPassword(password) {
  if (password.length < 8) return false;
  let digits = [...password].filter(c => "0123456789".includes(c)).length;
  return digits >= 2;
}

function clearForm() {
  NameInput.value = "";
  EmailInput.value = "";
  PasswordInput.value = "";
}

Button.addEventListener("click", signUp);




