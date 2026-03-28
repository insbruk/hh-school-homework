import * as store from "./storage.js";
import * as view from "./view.js";

const BASE_URL = "http://localhost:5000";
const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};
const HTTP_CONTENT_TYPE = {
  JSON: "application/json",
  //...
};

// Задача #1
async function handleLogin(username = "User", password = "qwerty12345") {
  const body = JSON.stringify({
    username,
    password,
  });

  const result = await fetch(`${BASE_URL}/login`, {
    method: HTTP_METHOD.POST,
    headers: {
      "Content-Type": HTTP_CONTENT_TYPE.JSON,
    },
    body,
  });

  if (result.ok) {
    const data = await result.json();
    localStorage.setItem("accessToken", data.accessToken);
  }
}

// Задача #2
async function handleInputChange({ target: { value } }) {
  localStorage.setItem("searchTitle", value);
}

// Задача #2
async function handleSelectChange({ target: { value } }) {
  localStorage.setItem("filterStatus", value);
}

// Задача #3 и #4
async function handleSearchTasks() {
  const token = localStorage.getItem("accessToken");
  const title = localStorage.getItem("searchTitle");
  const status = localStorage.getItem("filterStatus");

  const analyticsBody = JSON.stringify({
    action: "search",
    searchTitle: title,
    filterStatus: status,
  });
  navigator.sendBeacon(`${BASE_URL}/analytics`, analyticsBody);

  const params = new URLSearchParams();
  if (title) params.append("title", title);
  if (status) params.append("status", status);

  const queryString = params.toString();
  const requestURL = `${BASE_URL}/tasks${queryString ? "?" + queryString : ""}`;

  const result = await fetch(requestURL, {
    method: HTTP_METHOD.GET,
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (result.ok) {
    const data = await result.json();
    localStorage.setItem("tasks", JSON.stringify(data.items));
  }
}

// Задача #5
async function handleLogout() {
  const token = localStorage.getItem("accessToken");

  const result = await fetch(`${BASE_URL}/logout`, {
    method: HTTP_METHOD.POST,
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (result.ok) {
    localStorage.removeItem("accessToken");
  }
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
