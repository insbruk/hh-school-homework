import * as store from "./storage.js";
import * as view from "./view.js";

const BASE_URL = "http://localhost:5000";

function buildTasksUrl(searchTitle, filterStatus) {
  const params = new URLSearchParams();

  if (searchTitle) {
    params.set("title", searchTitle);
  }

  if (filterStatus) {
    params.set("status", filterStatus);
  }

  const queryString = params.toString();

  return queryString ? `${BASE_URL}/tasks?${queryString}` : `${BASE_URL}/tasks`;
}
// Задача #1
async function handleLogin() {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "ivan",
      password: "123",
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error status: ${response.status}`);
  }

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
}

// Задача #2
async function handleInputChange({ target: { value } }) {
  store.setSearchTitle(value);
}

// Задача #2
async function handleSelectChange({ target: { value } }) {
  store.setFilterStatus(value);
}

// Задача #3 и #4
async function handleSearchTasks() {
  const accessToken = localStorage.getItem("accessToken");

  if (!store.isAuthorized()) {
    store.setTasks(JSON.stringify([]));
    return;
  }

  const searchTitle = localStorage.getItem("searchTitle") || "";
  const filterStatus = localStorage.getItem("filterStatus") || "";

  const response = await fetch(buildTasksUrl(searchTitle, filterStatus), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error status: ${response.status}`);
  }

  const data = await response.json();
  store.setTasks(JSON.stringify(data.items));

  const analyticsPayload = {
    action: "search",
    searchTitle,
    filterStatus,
  };

  const analyticsBlob = new Blob([JSON.stringify(analyticsPayload)], {
    type: "application/json",
  });

  navigator.sendBeacon(`${BASE_URL}/analytics`, analyticsBlob);
}
// Задача #5
async function handleLogout() {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error status: ${response.status}`);
  }

  localStorage.removeItem("accessToken");
}

// Код ниже редактировать не нужно
async function handleSearch() {
  await handleSearchTasks();
  view.updateAppContent();
}

async function handleAuthorization() {
  try {
    if (store.isAuthorized()) {
      await handleLogout();
      store.reset();
    } else {
      await handleLogin();
      store.setSearchTitle("");
      store.setFilterStatus("");
      view.updateSearchInput("");
      view.updateFilterStatus("");
      await handleSearchTasks();
    }
    view.updateAppContent();
  } catch (e) {
    alert("Не удалось. Попробуйте еще раз!");
  }
}

handleSearchTasks().then(() => {
  view.updateAppContent();
  view.updateSearchInput(localStorage.getItem("searchTitle") || "");
  view.updateFilterStatus(localStorage.getItem("filterStatus") || "");
});

const searchInputElement = document.getElementById("searchInput");
const filterSelectElement = document.getElementById("filterStatus");
const authButtonElement = document.getElementById("authButton");
const searchButtonElement = document.getElementById("searchButton");

searchInputElement.addEventListener("keyup", handleInputChange);
filterSelectElement.addEventListener("change", handleSelectChange);
authButtonElement.addEventListener("click", handleAuthorization);
searchButtonElement.addEventListener("click", handleSearch);
