// Load from localStorage or initialize
let users = JSON.parse(localStorage.getItem("users")) || [];
let workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// SAVE helper
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("workspaces", JSON.stringify(workspaces));
}

// REGISTER
function addUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!name || !email || !password) {
    document.getElementById("message").textContent = "Fill all fields";
    return;
  }

  users.push({ name, email, password, role });
  saveData();

  document.getElementById("message").textContent = "Account created!";
}

// LOGIN
function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    document.getElementById("loginMessage").textContent = "Invalid login";
    return;
  }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));

  if (user.role === "owner") {
    window.location.href = "owner.html";
  } else {
    window.location.href = "index.html";
  }
}

// ADD WORKSPACE
function addWorkspace() {
  const propertyName = document.getElementById("propertyName").value;
  const location = document.getElementById("location").value;
  const price = document.getElementById("price").value;

  if (!propertyName || !location || !price) {
    document.getElementById("ownerMessage").textContent = "Fill all fields";
    return;
  }

  workspaces.push({
    propertyName,
    location,
    price,
    owner: currentUser.email
  });

  saveData();

  document.getElementById("ownerMessage").textContent = "Workspace added!";
  displayWorkspaces();
}

// SEARCH + DISPLAY
function searchWorkspaces() {
  const location = document.getElementById("searchLocation").value.toLowerCase();

  let filtered = workspaces.filter(w =>
    w.location.toLowerCase().includes(location)
  );

  displayResults(filtered);
}

// DISPLAY RESULTS
function displayResults(list) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  list.forEach((w, index) => {
    let div = document.createElement("div");
    div.classList.add("workspace");

    div.innerHTML = `
      <h3>${w.propertyName}</h3>
      <p>📍 ${w.location}</p>
      <p>💲 $${w.price}</p>
    `;

    // OWNER CONTROLS
    if (currentUser && currentUser.role === "owner" && w.owner === currentUser.email) {
      let delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => deleteWorkspace(index);

      div.appendChild(delBtn);
    }

    resultsDiv.appendChild(div);
  });
}

// OWNER VIEW DISPLAY
function displayWorkspaces() {
  if (!currentUser) return;

  let filtered = workspaces.filter(w => w.owner === currentUser.email);
  displayResults(filtered);
}

// DELETE
function deleteWorkspace(index) {
  workspaces.splice(index, 1);
  saveData();
  displayWorkspaces();
}

// AUTO LOAD (for owner page)
window.onload = function () {
  if (window.location.pathname.includes("owner.html")) {
    displayWorkspaces();
  }
};