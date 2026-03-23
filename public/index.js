import * as store from './storage.js';
import * as view from './view.js';

const API_URL = 'http://localhost:5000';

// Задача #1
async function handleLogin() {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ivan', password: '123' }),
    });

    if (!response.ok) {
      throw new Error(
        `Login failed: ${response.status} ${response.statusText}`,
      );
    }

    const { accessToken } = await response.json();

    if (!accessToken) {
      throw new Error('Token not received');
    }

    localStorage.setItem('accessToken', accessToken);
  } catch (err) {
    console.error(err);
  }
}

// Задача #2
function handleInputChange({ target: { value } }) {
  store.setSearchTitle(value);
}

// Задача #2
function handleSelectChange({ target: { value } }) {
  store.setFilterStatus(value);
}

// Задача #3 и #4
async function handleSearchTasks() {
  if (!store.isAuthorized()) {
    return;
  }

  const searchTitle = localStorage.getItem('searchTitle') || '';
  const filterStatus = localStorage.getItem('filterStatus') || '';

  // Analytics
  const analyticsBody = JSON.stringify({
    action: 'search',
    searchTitle,
    filterStatus,
  });
  navigator.sendBeacon(
    `${API_URL}/analytics`,
    new Blob([analyticsBody], { type: 'application/json' }),
  );

  // Tasks
  try {
    const queryParams = new URLSearchParams();
    if (searchTitle) queryParams.set('title', searchTitle);
    if (filterStatus) queryParams.set('status', filterStatus);

    const response = await fetch(`${API_URL}/tasks?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText}`,
      );
    }

    const { items } = await response.json();
    store.setTasks(JSON.stringify(items));
  } catch (err) {
    console.error(err);
  }
}

// Задача #5
async function handleLogout() {
  if (!store.isAuthorized()) {
    return;
  }
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Logout failed: ${response.status} ${response.statusText}`,
      );
    }
    localStorage.removeItem('accessToken');
  } catch (err) {
    console.error(err);
  }
}

// Задача #6 - Бонусная
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSearch = debounce(async () => {
  await handleSearchTasks();
  view.updateAppContent();
}, 500);

function handleInputChangeWithSearch(event) {
  handleInputChange(event);
  debouncedSearch();
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
      store.setSearchTitle('');
      store.setFilterStatus('');
      view.updateSearchInput('');
      view.updateFilterStatus('');
      await handleSearchTasks();
    }
    view.updateAppContent();
  } catch (e) {
    alert('Не удалось. Попробуйте еще раз!');
  }
}

handleSearchTasks().then(() => {
  view.updateAppContent();
  view.updateSearchInput(localStorage.getItem('searchTitle') || '');
  view.updateFilterStatus(localStorage.getItem('filterStatus') || '');
});

const searchInputElement = document.getElementById('searchInput');
const filterSelectElement = document.getElementById('filterStatus');
const authButtonElement = document.getElementById('authButton');
const searchButtonElement = document.getElementById('searchButton');

// searchInputElement.addEventListener("keyup", handleInputChange); //original
searchInputElement.addEventListener('keyup', handleInputChangeWithSearch); // Задача #6 - Бонусная
filterSelectElement.addEventListener('change', handleSelectChange);
authButtonElement.addEventListener('click', handleAuthorization);
searchButtonElement.addEventListener('click', handleSearch);
