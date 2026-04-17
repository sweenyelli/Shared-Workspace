// =======================
// STORAGE (clean structure)
// =======================
const store = {
  users: JSON.parse(localStorage.getItem("users")) || [],
  properties: JSON.parse(localStorage.getItem("properties")) || [],
  workspaces: JSON.parse(localStorage.getItem("workspaces")) || [],
  currentUser: JSON.parse(localStorage.getItem("currentUser")) || null,

  save() {
    localStorage.setItem("users", JSON.stringify(this.users));
    localStorage.setItem("properties", JSON.stringify(this.properties));
    localStorage.setItem("workspaces", JSON.stringify(this.workspaces));
  },

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  }
};

const $ = (id) => document.getElementById(id);

// =======================
// AUTH
// =======================
function addUser() {
  const name = $("name").value.trim();
  const email = $("email").value.trim();
  const phone = $("phone").value.trim();
  const password = $("password").value;
  const role = $("role").value;
  const message = $("message");

  if (!name || !email || !password || !phone) {
    message.textContent = "Please fill all fields";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.textContent = "Invalid email format";
    return;
  }

  if (password.length < 4) {
    message.textContent = "Password must be at least 4 characters";
    return;
  }

  if (store.users.find(u => u.email === email)) {
    message.textContent = "Email already registered";
    return;
  }

  const newUser = { id: crypto.randomUUID(), name, email, phone, password, role };

  store.users.push(newUser);
  store.setUser(newUser);
  store.save();

  window.location.href = role === "owner" ? "owner.html" : "index.html";
}

function login() {
  const email = $("loginEmail").value;
  const password = $("loginPassword").value;
  const message = $("loginMessage");

  const user = store.users.find(u => u.email === email && u.password === password);

  if (!user) {
    message.textContent = "Invalid login";
    return;
  }

  store.setUser(user);
  window.location.href = user.role === "owner" ? "owner.html" : "index.html";
}

function logout() {
  store.logout();
  window.location.href = "index.html";
}

// =======================
// PROPERTY
// =======================
let editingPropertyId = null;

function saveProperty() {
  const address = $("address").value;
  const neighborhood = $("neighborhood").value;
  const sqft = Number($("sqft").value);
  const parking = $("parking").checked;
  const transport = $("transport").checked;

  if (!address || !neighborhood || !sqft) {
    alert("Fill all fields");
    return;
  }

  if (editingPropertyId) {
    const p = store.properties.find(p => p.id === editingPropertyId);
    Object.assign(p, { address, neighborhood, sqft, parking, transport });
  } else {
    store.properties.push({
      id: crypto.randomUUID(),
      address,
      neighborhood,
      sqft,
      parking,
      transport,
      owner: store.currentUser.email
    });
  }

  store.save();
  resetPropertyForm();
  displayOwner();
}

function editProperty(id) {
  const p = store.properties.find(p => p.id === id);
  editingPropertyId = id;

  $("propertyFormTitle").textContent = "Edit Property";
  $("address").value = p.address;
  $("neighborhood").value = p.neighborhood;
  $("sqft").value = p.sqft;
  $("parking").checked = p.parking;
  $("transport").checked = p.transport;
}

function resetPropertyForm() {
  editingPropertyId = null;
  $("propertyFormTitle").textContent = "Add Property";

  $("address").value = "";
  $("neighborhood").value = "";
  $("sqft").value = "";
  $("parking").checked = false;
  $("transport").checked = false;
}

// =======================
// WORKSPACE
// =======================
let editingWorkspaceId = null;

function saveWorkspace() {
  const propertyId = Number($("propertySelect").value);
  const type = $("type").value;
  const seats = Number($("seats").value);
  const smoking = $("smoking").checked;
  const date = $("date").value;
  const lease = $("lease").value;
  const price = Number($("price").value);

  if (!type || !seats || !price || !date) {
    alert("Fill all fields");
    return;
  }

  if (editingWorkspaceId) {
    const w = store.workspaces.find(w => w.id === editingWorkspaceId);
    Object.assign(w, { propertyId, type, seats, smoking, date, lease, price });
  } else {
    store.workspaces.push({
      id: crypto.randomUUID(),
      propertyId,
      type,
      seats,
      smoking,
      date,
      lease,
      price
    });
  }

  store.save();
  resetWorkspaceForm();
  displayOwner();
}

function editWorkspace(id) {
  const w = store.workspaces.find(w => w.id === id);
  editingWorkspaceId = id;

  $("workspaceFormTitle").textContent = "Edit Workspace";

  $("propertySelect").value = w.propertyId;
  $("type").value = w.type;
  $("seats").value = w.seats;
  $("smoking").checked = w.smoking;
  $("date").value = w.date;
  $("lease").value = w.lease;
  $("price").value = w.price;
}

function resetWorkspaceForm() {
  editingWorkspaceId = null;
  $("workspaceFormTitle").textContent = "Add Workspace";

  $("type").value = "";
  $("seats").value = "";
  $("smoking").checked = false;
  $("date").value = "";
  $("price").value = "";
}

// =======================
// OWNER VIEW
// =======================
function displayOwner() {
  const results = $("results");
  if (!results) return;

  results.innerHTML = "";

  const myProps = store.properties.filter(p => p.owner === store.currentUser.email);

  if (myProps.length === 0) {
    results.innerHTML = "<p>No properties yet</p>";
    return;
  }

  myProps.forEach(p => {
    const div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${p.address}</h3>
      <p>${p.neighborhood}</p>
    `;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editProperty(p.id);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "danger";
    delBtn.onclick = () => {
      store.properties = store.properties.filter(x => x.id !== p.id);
      store.workspaces = store.workspaces.filter(w => w.propertyId !== p.id);
      store.save();
      displayOwner();
    };

    div.append(editBtn, delBtn);

    const ws = store.workspaces.filter(w => w.propertyId === p.id);

    ws.forEach(w => {
      const wDiv = document.createElement("div");
      wDiv.className = "workspace";

      wDiv.innerHTML = `
        <h4>${w.type}</h4>
        <p>Seats: ${w.seats}</p>
        <p>Price: $${w.price}</p>
      `;

      const editW = document.createElement("button");
      editW.textContent = "Edit";
      editW.onclick = () => editWorkspace(w.id);

      const delW = document.createElement("button");
      delW.textContent = "Delete";
      delW.className = "danger";
      delW.onclick = () => {
        store.workspaces = store.workspaces.filter(x => x.id !== w.id);
        store.save();
        displayOwner();
      };

      wDiv.append(editW, delW);
      div.appendChild(wDiv);
    });

    results.appendChild(div);
  });
}

// =======================
// SEARCH
// =======================
function searchWorkspaces() {
  const results = $("results");

  let list = store.workspaces.map(w => ({
    ...w,
    property: store.properties.find(p => p.id === w.propertyId)
  }));

  const location = $("searchLocation").value.toLowerCase();
  const neighborhood = $("searchNeighborhood").value.toLowerCase();

  if (location)
    list = list.filter(w => w.property?.address.toLowerCase().includes(location));

  if (neighborhood)
    list = list.filter(w => w.property?.neighborhood.toLowerCase().includes(neighborhood));

  results.innerHTML = "";

  if (list.length === 0) {
    results.innerHTML = "<p>No results found</p>";
    return;
  }

  list.forEach(w => {
    const div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${w.type}</h3>
      <p>${w.property?.address}</p>
      <p>Seats: ${w.seats}</p>
      <p>Price: $${w.price}</p>
    `;

    const btn = document.createElement("button");
    btn.textContent = "View Details";
    btn.onclick = () => {
      localStorage.setItem("selectedWorkspace", JSON.stringify(w));
      window.location.href = "details.html";
    };

    div.appendChild(btn);
    results.appendChild(div);
  });
}

// =======================
// DETAILS
// =======================
function loadDetails() {
  const container = $("details");
  if (!container) return;

  const w = JSON.parse(localStorage.getItem("selectedWorkspace"));
  if (!w) return;

  const property = store.properties.find(p => p.id === w.propertyId);
  const owner = store.users.find(u => u.email === property.owner);

  container.innerHTML = `
    <h2>${w.type}</h2>
    <p>Seats: ${w.seats}</p>
    <p>Price: $${w.price}</p>
    <p>Address: ${property.address}</p>
    <p>Owner: ${owner.name}</p>
  `;
}

// =======================
// INIT
// =======================
window.onload = () => {
  if (location.pathname.includes("owner.html")) {
    if (!store.currentUser || store.currentUser.role !== "owner") {
      window.location.href = "login.html";
      return;
    }
    displayOwner();
  }

  if (location.pathname.includes("index.html")) {
    searchWorkspaces();
  }

  if (location.pathname.includes("details.html")) {
    loadDetails();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const btn = $("searchBtn");
  if (btn) btn.addEventListener("click", searchWorkspaces);
});