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

//changed twice
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

  setTimeout(() => 
  {
    window.location.href =
      newUser.role === "owner" ? "owner.html" : "index.html";
  }, 1000);
}

//new
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

//newer
function addProperty() 
{
  const address = $("address");
  const neighborhood = $("neighborhood");
  const sqft = $("sqft");
  const parking = $("parking");
  const transport = $("transport");

  if (!address.value || !neighborhood.value || !sqft.value) 
  {
    alert("Fill all property fields");
    return;
  }

  properties.push({
    id: Date.now(),
    address: address.value,
    neighborhood: neighborhood.value,
    sqft: Number(sqft.value),
    parking: parking.checked,
    transport: transport.checked,
    owner: currentUser.email
  });

  save();
  populatePropertyDropdown();
  displayOwner();
}

function addWorkspace() 
{
  const propertySelect = $("propertySelect");
  const type = $("type");
  const seats = $("seats");
  const smoking = $("smoking");
  const date = $("date");
  const lease = $("lease");
  const price = $("price");

  if (!propertySelect.value || !type.value || !seats.value || !price.value || !date.value) 
  {
    alert("Fill all workspace fields");
    return;
  }

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

  save();
  displayOwner();
}

// temporary
//function populatePropertyDropdown() 
//{
//  if (!propertySelect) return;

//  propertySelect.innerHTML = "";

//  properties
//    .filter(p => p.owner === currentUser.email)
//   .forEach(p => {
//      let opt = document.createElement("option");
//     opt.value = p.id;
//      opt.textContent = p.address;
//      propertySelect.appendChild(opt);
//    });
//}

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

  myProperties.forEach(p => 
  {
    let opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.address;
    propertySelect.appendChild(opt);
  });
}

async function searchWorkspaces() {
  const res = await fetch("http://localhost:3000/api/workspaces");
  const data = await res.json();

  if (!data.success) {
    alert("Failed to load data");
    return;
  }

  const list = data.data;

  results.innerHTML = "";

  list.forEach(w => {
    let div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${w.type}</h3>
      <p>Seats: ${w.seats}</p>
      <p>Price: $${w.price}</p>
    `;

    results.appendChild(div);
  });
}
//edited
function displayOwner() 
{
  if (!results) return;

  results.innerHTML = "";

  properties
    .filter(p => p.owner === currentUser.email)
    .forEach(p => 
    {
      let div = document.createElement("div");
      div.className = "workspace";

      div.innerHTML = `
        <h3>${p.address}</h3>
        <p>${p.neighborhood}</p>
      `;

      let editProp = document.createElement("button");//prop btn
      editProp.textContent = "Edit Property";
      editProp.onclick = () => editProperty(p.id);

      let delProp = document.createElement("button");
      delProp.textContent = "Delete Property";
      delProp.className = "danger";
      delProp.onclick = () => 
      {
        properties = properties.filter(x => x.id !== p.id);
        workspaces = workspaces.filter(w => w.propertyId !== p.id); //delete
        save();
        displayOwner();
      };

      div.append(editProp, delProp);

      //ws under prop
      workspaces
        .filter(w => w.propertyId === p.id)
        .forEach(w => {
          let wDiv = document.createElement("div");

          wDiv.className = "workspace";

          wDiv.innerHTML = `
            <h4>${w.type}</h4>
            <p>Seats: ${w.seats}</p>
            <p>Price: $${w.price}</p>
          `;

          //edit
          let editW = document.createElement("button");
          editW.textContent = "Edit Workspace";
          editW.onclick = () => editWorkspace(w.id);

          //delete
          let delW = document.createElement("button");
          delW.textContent = "Delete Workspace";
          delW.className = "danger";
          delW.onclick = () =>
          {
            workspaces = workspaces.filter(x => x.id !== w.id);
            save();
            displayOwner();
          };

          let btnRow = document.createElement("div");
          btnRow.className = "row";

          btnRow.append(editW, delW);
          wDiv.appendChild(btnRow);

          div.appendChild(wDiv);
        });

      results.appendChild(div); //property
    });
}

//changed 4 times
window.onload = () => 
  {

  updateNavbar();

  if (location.pathname.includes("login.html") && currentUser) 
  {
    window.location.href =
      currentUser.role === "owner" ? "owner.html" : "index.html";
  }

  if (location.pathname.includes("owner.html")) 
  {
    if (!currentUser || currentUser.role !== "owner") 
    {
      window.location.href = "login.html";
      return;
    }

    populatePropertyDropdown();
    displayOwner();
  }

  if (location.pathname.includes("index.html")) 
  {
    searchWorkspaces();

    const btn = $("searchBtn");
    if (btn) btn.addEventListener("click", searchWorkspaces);
  }

  if (location.pathname.includes("details.html")) 
  {
    loadDetails();
  }
};


//edited onload navbar
function updateNavbar() 
{
  const nav = document.getElementById("navBar");
  if (!nav) return;

  nav.innerHTML = `<a href="index.html">Home</a>`;

  if (currentUser) 
  {
    // Logged in
    if (currentUser.role === "owner") 
    {
      nav.innerHTML += `<a href="owner.html">Dashboard</a>`;
    }

    nav.innerHTML += `
      <span style="margin-left:15px;">Hi, ${currentUser.name}</span>
      <button onclick="logout()" style="margin-left:10px; width:auto; padding:6px 10px;">
        Logout
      </button>
    `;
  } 
  else 
  {
    //for not logged in
    nav.innerHTML += `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

function loadDetails() 
{
  const container = document.getElementById("details");
  if (!container) return;

  let w = JSON.parse(localStorage.getItem("selectedWorkspace"));

  if (!w) 
  {
    container.innerHTML = "<p>No workspace selected</p>";
    return;
  }

  let property = properties.find(p => p.id === w.propertyId);

  if (!property) 
  {
    container.innerHTML = "<p>Data missing (property not found)</p>";
    return;
  }

  let owner = users.find(u => u.email === property.owner);

  if (!owner) 
  {
    container.innerHTML = "<p>Data missing (owner not found)</p>";
    return;
  }

  container.innerHTML = `
    <h2>${w.type}</h2>

    <h3>Workspace Info</h3>
    <p><strong>Seats:</strong> ${w.seats}</p>
    <p><strong>Price:</strong> $${w.price}</p>
    <p><strong>Smoking:</strong> ${w.smoking ? "Yes" : "No"}</p>
    <p><strong>Available From:</strong> ${w.date}</p>
    <p><strong>Lease:</strong> ${w.lease}</p>

    <h3>Property Info</h3>
    <p><strong>Address:</strong> ${property.address}</p>
    <p><strong>Neighborhood:</strong> ${property.neighborhood}</p>
    <p><strong>Sqft:</strong> ${property.sqft}</p>
    <p><strong>Parking:</strong> ${property.parking ? "Yes" : "No"}</p>
    <p><strong>Public Transport:</strong> ${property.transport ? "Yes" : "No"}</p>

    <h3>Owner Contact</h3>
    <p><strong>Name:</strong> ${owner.name}</p>
    <p><strong>Email:</strong> ${owner.email}</p>
    <p><strong>Phone:</strong> ${owner.phone}</p>
  `;
}


//new
function saveProperty() 
{
  if (!address.value || !neighborhood.value || !sqft.value) 
  {
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
  } 
  else 
  {
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

function editProperty(id) 
{
  let p = properties.find(p => p.id === id);

  editingPropertyId = id;
  propertyFormTitle.textContent = "Edit Property";

  address.value = p.address;
  neighborhood.value = p.neighborhood;
  sqft.value = p.sqft;
  parking.checked = p.parking;
  transport.checked = p.transport;
}

function resetPropertyForm() 
{
  editingPropertyId = null;
  propertyFormTitle.textContent = "Add Property";

  address.value = "";
  neighborhood.value = "";
  sqft.value = "";
  parking.checked = false;
  transport.checked = false;
}

//anotha one
function saveWorkspace() 
{

  const propertySelect = $("propertySelect");

  if (!type.value || !seats.value || !price.value) 
  {
    alert("Fill all fields");
    return;
  }

  if (editingWorkspaceId) 
  {
    let w = workspaces.find(w => w.id === editingWorkspaceId);

    w.propertyId = Number(propertySelect.value);
    w.type = type.value;
    w.seats = Number(seats.value);
    w.smoking = smoking.checked;
    w.date = date.value;
    w.lease = lease.value;
    w.price = Number(price.value);
  } 
  else 
  {
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

function editWorkspace(id) 
{
  let w = workspaces.find(w => w.id === id);

  const propertySelect = $("propertySelect");

  editingWorkspaceId = id;
  //edited
  const workspaceFormTitle = $("workspaceFormTitle");
  if (workspaceFormTitle) workspaceFormTitle.textContent = "Edit Workspace";

  propertySelect.value = w.propertyId;
  type.value = w.type;
  seats.value = w.seats;
  smoking.checked = w.smoking;
  date.value = w.date;
  lease.value = w.lease;
  price.value = w.price;
}

function resetWorkspaceForm() 
{
  editingWorkspaceId = null;
  //edited
  const workspaceFormTitle = $("workspaceFormTitle");
  if (workspaceFormTitle) workspaceFormTitle.textContent = "Add Workspace";

  type.value = "";
  seats.value = "";
  smoking.checked = false;
  date.value = "";
  price.value = "";

  const propertySelect = $("propertySelect");
  if (propertySelect) propertySelect.selectedIndex = 0;
}

//for logout
function logout() 
{
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => 
{
  const btn = $("searchBtn");
  if (btn) btn.addEventListener("click", searchWorkspaces);
});
