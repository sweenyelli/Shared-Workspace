let users = JSON.parse(localStorage.getItem("users")) || [];
let properties = JSON.parse(localStorage.getItem("properties")) || [];
let workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function save() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("properties", JSON.stringify(properties));
  localStorage.setItem("workspaces", JSON.stringify(workspaces));
}

// ================= USERS =================

function addUser() {
  users.push({
    name: name.value,
    email: email.value,
    phone: phone.value,
    password: password.value,
    role: role.value
  });

  save();
  message.textContent = "User created!";
}

function login() {
  const user = users.find(u =>
    u.email === loginEmail.value &&
    u.password === loginPassword.value
  );

  if (!user) {
    loginMessage.textContent = "Invalid login";
    return;
  }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));

  window.location.href = user.role === "owner"
    ? "owner.html"
    : "index.html";
}

// ================= PROPERTY =================

function addProperty() {
  properties.push({
    id: Date.now(),
    address: address.value,
    neighborhood: neighborhood.value,
    sqft: sqft.value,
    parking: parking.checked,
    transport: transport.checked,
    owner: currentUser.email
  });

  save();
  displayOwner();
}

// ================= WORKSPACE =================

function addWorkspace() {
  workspaces.push({
    id: Date.now(),
    propertyId: properties[properties.length - 1].id,
    type: type.value,
    seats: seats.value,
    smoking: smoking.checked,
    date: date.value,
    lease: lease.value,
    price: price.value,
    ratings: [],
    reviews: []
  });

  save();
  displayOwner();
}

// ================= SEARCH =================

function searchWorkspaces() {
  let list = workspaces.map(w => {
    let p = properties.find(x => x.id === w.propertyId);
    return { ...w, property: p };
  });

  list = list.filter(w =>
    w.property?.address.toLowerCase().includes(searchLocation.value.toLowerCase())
  );

  if (maxPrice.value)
    list = list.filter(w => Number(w.price) <= Number(maxPrice.value));

  if (minSeats.value)
    list = list.filter(w => Number(w.seats) >= Number(minSeats.value));

  if (filterParking.checked)
    list = list.filter(w => w.property?.parking);

  // SORT
  if (sortBy.value === "priceLow")
    list.sort((a,b) => a.price - b.price);

  if (sortBy.value === "priceHigh")
    list.sort((a,b) => b.price - a.price);

  if (sortBy.value === "rating")
    list.sort((a,b) => avg(b.ratings) - avg(a.ratings));

  if (sortBy.value === "date")
    list.sort((a,b) => new Date(a.date) - new Date(b.date));

  results.innerHTML = "";

  list.forEach(w => {
    let div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${w.type}</h3>
      <p>${w.property.address}</p>
      <p>Seats: ${w.seats}</p>
      <p>Price: $${w.price}</p>
      <p>⭐ ${avg(w.ratings)}</p>
    `;

    let rate = document.createElement("button");
    rate.textContent = "Rate";
    rate.onclick = () => {
      let r = prompt("Rate 1-5");
      w.ratings.push(Number(r));
      save();
      searchWorkspaces();
    };

    let review = document.createElement("button");
    review.textContent = "Review";
    review.onclick = () => {
      let text = prompt("Write review");
      w.reviews.push(text);
      save();
      searchWorkspaces();
    };

    div.appendChild(rate);
    div.appendChild(review);

    results.appendChild(div);
  });
}

// ================= OWNER VIEW =================

function displayOwner() {
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
        <p>${p.sqft} sqft</p>
      `;

      let del = document.createElement("button");
      del.textContent = "Delete";
      del.onclick = () => {
        properties = properties.filter(x => x.id !== p.id);
        save();
        displayOwner();
      };

      div.appendChild(del);
      results.appendChild(div);
    });
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

// AUTO LOAD
window.onload = () => {
  if (location.pathname.includes("owner.html")) {
    displayOwner();
  }
};