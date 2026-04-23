let users = JSON.parse(localStorage.getItem("users")) || [];
let properties = JSON.parse(localStorage.getItem("properties")) || [];
let workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let editingPropertyId = null;
let editingWorkspaceId = null;

const $ = (id) => document.getElementById(id);

function save() 
{
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("properties", JSON.stringify(properties));
  localStorage.setItem("workspaces", JSON.stringify(workspaces));
}

function addUser() 
{
  const name = $("name");
  const email = $("email");
  const phone = $("phone");
  const password = $("password");
  const role = $("role");
  const message = $("message");

  if (!name.value || !email.value || !password.value || !phone.value) 
  {
    message.textContent = "Please fill all fields";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value)) 
  {
    message.textContent = "Invalid email format";
    return;
  }

  if (password.value.length < 4) 
  {
    message.textContent = "Password must be at least 4 characters";
    return;
  }

  if (users.find(u => u.email === email.value)) 
  {
    message.textContent = "Email already registered";
    return;
  }

  const newUser = 
  {
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
    role: role.value
  };

  users.push(newUser);
  currentUser = newUser;

  localStorage.setItem("currentUser", JSON.stringify(newUser));
  save();

  message.textContent = "Account created! Logging in...";

  setTimeout(() => {
    window.location.href =
      newUser.role === "owner" ? "owner.html" : "index.html";
  }, 1000);
}

function login() 
{
  const email = $("loginEmail").value;
  const password = $("loginPassword").value;
  const message = $("loginMessage");

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) 
  {
    message.textContent = "Invalid login";
    return;
  }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));

  window.location.href =
    user.role === "owner" ? "owner.html" : "index.html";
}

function logout() 
{
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function populatePropertyDropdown() 
{
  const propertySelect = $("propertySelect");
  if (!propertySelect || !currentUser) return;

  propertySelect.innerHTML = "";

  const myProperties = properties.filter(
    p => p.owner === currentUser.email
  );

  if (myProperties.length === 0) 
  {
    let opt = document.createElement("option");
    opt.textContent = "No properties available";
    opt.disabled = true;
    propertySelect.appendChild(opt);
    return;
  }

  myProperties.forEach(p => {
    let opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.address;
    propertySelect.appendChild(opt);
  });
}

function saveProperty() 
{
  const address = $("address");
  const neighborhood = $("neighborhood");
  const sqft = $("sqft");
  const parking = $("parking");
  const transport = $("transport");

  if (!address.value || !neighborhood.value || !sqft.value) {
    alert("Fill all fields");
    return;
  }

  if (editingPropertyId) 
  {
    let p = properties.find(p => p.id === editingPropertyId);
    p.address = address.value;
    p.neighborhood = neighborhood.value;
    p.sqft = Number(sqft.value);
    p.parking = parking.checked;
    p.transport = transport.checked;
  } else {
    properties.push({
      id: Date.now(),
      address: address.value,
      neighborhood: neighborhood.value,
      sqft: Number(sqft.value),
      parking: parking.checked,
      transport: transport.checked,
      owner: currentUser.email
    });
  }

  save();
  resetPropertyForm();
  populatePropertyDropdown();
  displayOwner();
}

function editProperty(id) {
  let p = properties.find(p => p.id === id);

  editingPropertyId = id;

  $("address").value = p.address;
  $("neighborhood").value = p.neighborhood;
  $("sqft").value = p.sqft;
  $("parking").checked = p.parking;
  $("transport").checked = p.transport;
}

function resetPropertyForm() {
  editingPropertyId = null;

  $("address").value = "";
  $("neighborhood").value = "";
  $("sqft").value = "";
  $("parking").checked = false;
  $("transport").checked = false;
}

// ================== WORKSPACES ==================
function saveWorkspace() {
  const propertySelect = $("propertySelect");
  const type = $("type");
  const seats = $("seats");
  const smoking = $("smoking");
  const date = $("date");
  const lease = $("lease");
  const price = $("price");

  if (!type.value || !seats.value || !price.value) {
    alert("Fill all fields");
    return;
  }

  if (editingWorkspaceId) {
    let w = workspaces.find(w => w.id === editingWorkspaceId);

    w.propertyId = Number(propertySelect.value);
    w.type = type.value;
    w.seats = Number(seats.value);
    w.smoking = smoking.checked;
    w.date = date.value;
    w.lease = lease.value;
    w.price = Number(price.value);
  } else {
    workspaces.push({
      id: Date.now(),
      propertyId: Number(propertySelect.value),
      type: type.value,
      seats: Number(seats.value),
      smoking: smoking.checked,
      date: date.value,
      lease: lease.value,
      price: Number(price.value),
      ratings: [],
      reviews: []
    });
  }

  save();
  resetWorkspaceForm();
  displayOwner();
}

function editWorkspace(id) {
  let w = workspaces.find(w => w.id === id);

  editingWorkspaceId = id;

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

  $("type").value = "";
  $("seats").value = "";
  $("smoking").checked = false;
  $("date").value = "";
  $("price").value = "";
}

function searchWorkspaces() {
  const results = $("results");

  let list = workspaces.map(w => {
    let p = properties.find(x => x.id === w.propertyId);
    return { ...w, property: p };
  });

  results.innerHTML = "";

  list.forEach(w => {
    let div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${w.type}</h3>
      <p>${w.property?.address || "Unknown location"}</p>
      <p>Seats: ${w.seats}</p>
      <p>Price: $${w.price}</p>
    `;

    let view = document.createElement("button");
    view.textContent = "View Details";
    view.onclick = () => {
      localStorage.setItem("selectedWorkspace", JSON.stringify(w));
      window.location.href = "details.html";
    };

    div.appendChild(view);
    results.appendChild(div);
  });
}

function displayOwner() 
{
  const results = $("results");
  if (!results) return;

  results.innerHTML = "";

  properties
    .filter(p => p.owner === currentUser.email)
    .forEach(p => {
      let div = document.createElement("div");
      div.className = "workspace";

      div.innerHTML = `
        <h3>${p.address}</h3>
        <p>${p.neighborhood}</p>
      `;

      let delProp = document.createElement("button");
      delProp.textContent = "Delete Property";
      delProp.onclick = () => {
        properties = properties.filter(x => x.id !== p.id);
        workspaces = workspaces.filter(w => w.propertyId !== p.id);
        save();
        displayOwner();
      };

      div.appendChild(delProp);

      workspaces
        .filter(w => w.propertyId === p.id)
        .forEach(w => {
          let wDiv = document.createElement("div");

          wDiv.innerHTML = `
            <h4>${w.type}</h4>
            <p>Seats: ${w.seats}</p>
            <p>Price: $${w.price}</p>
          `;

          let delW = document.createElement("button");
          delW.textContent = "Delete Workspace";
          delW.onclick = () => {
            workspaces = workspaces.filter(x => x.id !== w.id);
            save();
            displayOwner();
          };

          wDiv.appendChild(delW);
          div.appendChild(wDiv);
        });

      results.appendChild(div);
    });
}

function loadDetails() 
{
  const container = $("details");
  if (!container) return;

  let w = JSON.parse(localStorage.getItem("selectedWorkspace"));
  if (!w) return;

  let property = properties.find(p => p.id === w.propertyId);
  let owner = users.find(u => u.email === property.owner);

  container.innerHTML = `
    <h2>${w.type}</h2>
    <p>Seats: ${w.seats}</p>
    <p>Price: $${w.price}</p>
    <p>Address: ${property.address}</p>
    <p>Owner: ${owner.name}</p>
    <p>Email: ${owner.email}</p>
  `;
}

function updateNavbar() 
{
  const nav = $("navBar");
  if (!nav) return;

  nav.innerHTML = `<a href="index.html">Home</a>`;

  if (currentUser) 
  {
    if (currentUser.role === "owner") 
    {
      nav.innerHTML += `<a href="owner.html">Dashboard</a>`;
    }

    nav.innerHTML += `
      <span>Hi, ${currentUser.name}</span>
      <button onclick="logout()">Logout</button>
    `;
  } 
  else 
  {
    nav.innerHTML += `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

window.onload = () => 
  {
  updateNavbar();

  if (location.pathname.includes("owner.html")) 
  {
    populatePropertyDropdown();
    displayOwner();
  }

  if (location.pathname.includes("index.html")) 
  {
    searchWorkspaces();
  }

  if (location.pathname.includes("details.html")) 
  {
    loadDetails();
  }
};
